(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Ray = require('./Ray');

module.exports = class Camera {
    constructor(position, viewDir, upDir, fov) {
        this.position = position;
        this.viewDir = Vec3.normalize(viewDir);
        this.upDir = Vec3.normalize(upDir);
        this.fov = fov || 1;

        this.rightDir = Vec3.normalize(Vec3.cross(upDir, viewDir));
    }

    createRay(x, y) {
    	const xOffsetVec = Vec3.scalarProd(x * this.fov, this.rightDir);
    	const yOffsetVec = Vec3.scalarProd(-y * this.fov, this.upDir);
    	const offsetVec = Vec3.add(xOffsetVec, yOffsetVec);

    	return new Ray(
    		this.position,
    		Vec3.normalize(Vec3.add(this.viewDir, offsetVec))
		);
    }
}

},{"./Ray":8,"./Vec3":13}],2:[function(require,module,exports){
function clamp(n) {
    if (n > 1) return 1;
    if (n < 0) return 0;
    return n;
}

module.exports = class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.clamp();
    }

    clamp() {
        this.r = clamp(this.r);
        this.g = clamp(this.g);
        this.b = clamp(this.b);
    }

    toGreyScale() {
        return (this.r + this.g + this.b) / 3;
    }

    toHexString() {
        return `#${this.channelHex(this.r)}${this.channelHex(this.g)}${this.channelHex(this.b)}`;
    }

    channelHex(v) {
        const intVal = Math.floor(v * 255);
        const hex = intVal.toString(16);

        if (hex.length === 1) {
            return '0' + hex;
        } else {
            return hex;
        }
    }
}

},{}],3:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Light = require('./Light');
const Color = require('./Color');
const Ray = require('./Ray');

module.exports = class DirectionalLight extends Light {
	constructor(direction, color, intensity) {
		super(color, intensity);

		this.direction = Vec3.normalize(direction);

		this.daCoeff = 0;
	}

    getDirection(pos) {
        return this.direction;
    }

    distanceAttenuation(pos) {
        return 1;
    }

	shadowAttenuation(pos, sceneShapes, debug) {
        var opacity = 1;
		const shadowRay = new Ray(pos, Vec3.scalarProd(-1, this.direction));

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay);
			if (intersect && (intersect.t > 0.001)) {
                if (shape.mat.transparency) {
                    opacity *= shape.mat.transparency;
                } else {
    				return 0;
                }
			}
		}

        return opacity;
	}
}

},{"./Color":2,"./Light":4,"./Ray":8,"./Vec3":13}],4:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Color = require('./Color');

module.exports = class Light {
	constructor(color, intensity) {
		this.color = color;
		this.intensity = intensity;
	}

	shade(intersect, sceneShapes, debug) {
		const resultColor = new Color(0, 0, 0);

		const pos = intersect.intersectionPoint;
		const mat = intersect.obj.mat;

        const lightDir = this.getDirection(pos);

        const coeff = this.shadowAttenuation(pos, sceneShapes, debug) * this.distanceAttenuation(pos);

        const cosTheta = Math.max(0, -Vec3.dot(intersect.normal, lightDir));

        var ambientColor, diffuseColor, specularColor;
        if (mat.diffuseMap) {
            const width = mat.diffuseMap.width;
			const height = mat.diffuseMap.height;

			const x = Math.round(intersect.texCoord.u * mat.diffuseMap.width);
			const y = Math.round(intersect.texCoord.v * mat.diffuseMap.height);

			const idx = (y * width + x) * 4;

			diffuseColor = new Color(
				(mat.diffuseMap.data[idx]) / 255,
				(mat.diffuseMap.data[idx + 1]) / 255,
				(mat.diffuseMap.data[idx + 2]) / 255
			);
			specularColor = diffuseColor;
        } else if (mat.proceduralTexture) {
            diffuseColor = mat.proceduralTexture(intersect.texCoord.u, intersect.texCoord.v, debug);
            specularColor = diffuseColor;

            if (debug) {
                console.log(intersect);
            }

        } else {
            diffuseColor = mat.kDiffuse;
            specularColor = mat.kSpecular;
        }
        ambientColor = mat.kAmbient;

		const specularCos = Math.max(0, -Vec3.dot(intersect.reflDir, lightDir));
        const specularCoeff = Math.pow(specularCos, mat.nSpecular);

        resultColor.r += this.intensity * this.color.r *
            (ambientColor.r + coeff * (diffuseColor.r * cosTheta + specularColor.r * specularCoeff));
        resultColor.g += this.intensity * this.color.g *
            (ambientColor.g + coeff * (diffuseColor.g * cosTheta + specularColor.g * specularCoeff));
        resultColor.b += this.intensity * this.color.b *
            (ambientColor.b + coeff * (diffuseColor.b * cosTheta + specularColor.b * specularCoeff));

		return resultColor;
	}
}

},{"./Color":2,"./Vec3":13}],5:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Color = require('./Color');
const Triangle = require('./Triangle');

const EPSILON = 0.0001;

module.exports = class MeshObject {
    constructor(mat, objName, offset) {
        this.mat = mat;
        $.get(`/objects/${objName}.obj`, objData => {
            const lines = objData.split('\n');

            this.vertices = [];
            this.texCoords = [];
            this.normals = [];
            this.faces = [];

            for (let line of lines) {
                if (line[0] == '#' || line[0] == 'o') {
                    continue;
                }

                const segs = line.split(' ');
                const type = segs[0];

                switch (type) {
                    case 'v':
                        const pos = new Vec3(parseFloat(segs[1]), parseFloat(segs[2]), parseFloat(segs[3]));

                        if (offset) {
                            pos.x += offset.x;
                            pos.y += offset.y;
                            pos.z += offset.z;
                        }
                        this.vertices.push(pos);
                        break;
                    case 'vt':
                        this.texCoords.push(new Vec3(parseFloat(segs[1]), parseFloat(segs[2]), 0));
                        break;
                    case 'vn':
                        this.normals.push(new Vec3(parseFloat(segs[1]), parseFloat(segs[2]), parseFloat(segs[3])));
                        break;
                    case 'f':
                        const vertices = [];

                        segs.slice(1).forEach(seg => {
                            const [vi, ti, ni] = seg.split('/').map(n => parseInt(n) - 1);
                            vertices.push({
                                pos: this.vertices[vi],
                                texCoord: this.texCoords[ti],
                                normal: this.normals[ni],
                            });
                        });

                        this.faces.push(new Triangle(vertices));
                        break;
                }
            }
        });
    }

    intersect(ray, debug) {
        var minT = Number.MAX_VALUE;
        var intersect;

        for (let face of this.faces) {
            const vertices = face.vertices;

            const p = Vec3.cross(ray.dir, face.e2);
            const det = Vec3.dot(face.e1, p);

            if (det > -EPSILON && det < EPSILON) {
                continue;
            }

            const invDet = 1 / det;
            var t = Vec3.subtract(ray.startingPos, vertices[0].pos);

            const u = Vec3.dot(t, p) * invDet;

            if (u < 0 || u > 1) {
                continue;
            }

            const q = Vec3.cross(t, face.e1);
            const v = Vec3.dot(ray.dir, q) * invDet;

            if (v < 0 || u + v > 1) {
                continue;
            }

            t = Vec3.dot(face.e2, q) * invDet;

            if (t < minT) {
                minT = t;

                var normal;

                if (this.mat.smoothing) {
                    normal = Vec3.add(
                        Vec3.scalarProd(u, vertices[1].normal),
                        Vec3.scalarProd(v, vertices[2].normal),
                        Vec3.scalarProd(1 - u - v, vertices[0].normal)
                    );
                } else {
                    normal = face.normal;
                }

                var texCoord;

                if (vertices[0].texCoord) {
                    const coords = Vec3.add(
                        Vec3.scalarProd(u, vertices[1].texCoord),
                        Vec3.scalarProd(v, vertices[2].texCoord),
                        Vec3.scalarProd(1 - u - v, vertices[0].texCoord)
                    );

                    texCoord = {
                        u: coords.x,
                        v: coords.y,
                    };
                }

                if (this.mat.normalMap) {
                    const width = this.mat.normalMap.width;
        			const height = this.mat.normalMap.height;

        			const x = Math.round(texCoord.u * this.mat.normalMap.width);
        			const y = Math.round(texCoord.v * this.mat.normalMap.height);

        			const idx = (y * width + x) * 4;

        			const normalMapColor = new Color(
        				(this.mat.normalMap.data[idx]) / 255,
        				(this.mat.normalMap.data[idx + 1]) / 255,
        				(this.mat.normalMap.data[idx + 2]) / 255
        			);

                    normal = Vec3.normalize(Vec3.add(
                        Vec3.scalarProd(normalMapColor.r, face.tangent),
                        Vec3.scalarProd(normalMapColor.g, face.bitangent),
                        Vec3.scalarProd(normalMapColor.b, normal)
                    ));
                }

        		const reflDir = Vec3.normalize(
        			Vec3.subtract(ray.dir,
        				Vec3.scalarProd(
        					2 * Vec3.dot(ray.dir, face.normal),
        					normal
        				)
        			)
        		);

                intersect = {
                    t: t,
                    rayDir: ray.dir,
        			intersectionPoint: ray.at(t),
                    normal: normal,
                    tangent: face.tangent,
                    bitangent: face.bitangent,
                    reflDir: reflDir,
                    obj: this,
                    texCoord: texCoord,
                };
            }
        }

        return intersect;
    }
}

},{"./Color":2,"./Triangle":12,"./Vec3":13}],6:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Light = require('./Light');
const Color = require('./Color');
const Ray = require('./Ray');

module.exports = class PointSpotLight extends Light {
	constructor(position, direction, angleCos, dropoffCoeff, color, intensity) {
		super(color, intensity);

		this.position = position;
		this.angleCos = angleCos;
		this.dropoffCoeff = dropoffCoeff;
		this.direction = Vec3.normalize(direction);

		this.daCoeff = 0.005;
	}

    getDirection(pos) {
        return Vec3.normalize(Vec3.subtract(pos, this.position));
    }

    distanceAttenuation(pos) {
        const pToLight = Vec3.subtract(this.position, pos);
        const lightDist = pToLight.magnitude();
        return 1 / (1 + this.daCoeff * lightDist + this.daCoeff * lightDist * lightDist);
    }

	shadowAttenuation(pos, sceneShapes, debug) {
        var opacity = 1;
		const intersectToLight = Vec3.subtract(this.position, pos);
		const shadowRay = new Ray(pos, intersectToLight);
		const maxT = intersectToLight.magnitude();

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay);
			if (intersect && (intersect.t > 0.01) && (intersect.t < maxT)) {
                if (shape.mat.transparency) {
                    opacity *= shape.mat.transparency;
                } else {
    				return 0;
                }
			}
		}

        return opacity;
	}
}

},{"./Color":2,"./Light":4,"./Ray":8,"./Vec3":13}],7:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class QuadraticShape {
	constructor(name, mat, pCenter, p0, p1, v1, s0, s1, s2, a02, a12, a22, a21, a00) {
        this.name = name;
		this.mat = mat;
		this.pCenter = pCenter;

		const v2 = Vec3.subtract(p1, p0);

		this.n2 = Vec3.normalize(v2);
		this.n0 = Vec3.normalize(Vec3.cross(v2, v1));
		this.n1 = Vec3.cross(this.n0, this.n2);

		this.s0 = s0;
		this.s1 = s1;
		this.s2 = s2;

		this.a02 = a02;
		this.a12 = a12;
		this.a22 = a22;
		this.a21 = a21;
		this.a00 = a00;
	}

	intersect(ray, debug) {
		const pe0 = Vec3.dot(this.n0, ray.dir) / this.s0;
		const pe1 = Vec3.dot(this.n1, ray.dir) / this.s1;
		const pe2 = Vec3.dot(this.n2, ray.dir) / this.s2;

		const camToCenter = Vec3.subtract(ray.startingPos, this.pCenter);

		const ec0 = Vec3.dot(this.n0, camToCenter) / this.s0;
		const ec1 = Vec3.dot(this.n1, camToCenter) / this.s1;
		const ec2 = Vec3.dot(this.n2, camToCenter) / this.s2;

		const A = this.a02 * Math.pow(pe0, 2) +
			this.a12 * Math.pow(pe1, 2) +
			this.a22 * Math.pow(pe2, 2);

		const B = this.a02 * (2 * pe0 * ec0) +
			this.a12 * (2 * pe1 * ec1) +
			this.a22 * (2 * pe2 * ec2) +
			this.a21 * pe2;

		const C = this.a02 * Math.pow(ec0, 2) +
			this.a12 * Math.pow(ec1, 2) +
			this.a22 * Math.pow(ec2, 2) +
			this.a21 * ec2 +
			this.a00;

		let t;

		if (A === 0) {
			t = -C / B;
		} else {
			const delta = Math.pow(B, 2) - 4 * A * C;

			if (delta < 0) {
				return;
			}

			const sqrtDelta = Math.sqrt(delta);

			t = Math.min((-B - sqrtDelta) / (2 * A), (-B + sqrtDelta) / (2 * A));
		}

		if (t <= 0) {
			return;
		}

		const intersectionPoint = ray.at(t);

		const relPos = Vec3.subtract(intersectionPoint, this.pCenter);

		const normal = Vec3.normalize(Vec3.add(
			Vec3.scalarProd(2 * this.a02 * (Vec3.dot(this.n0, relPos) / Math.pow(this.s0, 2)), this.n0),
			Vec3.scalarProd(2 * this.a12 * (Vec3.dot(this.n1, relPos) / Math.pow(this.s1, 2)), this.n1),
			Vec3.scalarProd(2 * this.a22 * (Vec3.dot(this.n2, relPos) / Math.pow(this.s2, 2)), this.n2),
			Vec3.scalarProd(this.a21 / this.s2, this.n2)
		));

		const reflDir = Vec3.normalize(
			Vec3.subtract(ray.dir,
				Vec3.scalarProd(
					2 * Vec3.dot(ray.dir, normal),
					normal
				)
			)
		);

		let u, v, tangent, bitangent;

		if (this.mat.diffuseMap || this.mat.normalMap || this.mat.iorMap || this.mat.proceduralTexture) {
			const tex0 = Vec3.dot(this.n0, relPos) / this.s0;
			const tex1 = Vec3.dot(this.n1, relPos) / this.s1;
			const tex2 = Vec3.dot(this.n2, relPos) / this.s2;

			v = Math.acos(tex2) / Math.PI;
			u = Math.acos(tex1 / Math.sin(Math.PI * v)) / (Math.PI * 2);

            if (this.mat.normalMap) {
                tangent = Vec3.normalize(Vec3.cross(ray.dir, normal));
                bitangent = Vec3.normalize(Vec3.cross(tangent, normal));
            }
		}

		return {
			t: t,
			rayDir: ray.dir,
			intersectionPoint: intersectionPoint,
			normal: normal,
            tangent: tangent,
            bitangent: bitangent,
			reflDir: reflDir,
			obj: this,
			texCoord: {
				u: u,
				v: v,
			},
		}
	}
}

},{"./Vec3":13}],8:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Ray {
	constructor(startingPos, dir) {
		this.startingPos = startingPos;
		this.dir = Vec3.normalize(dir);
	}

    at(t) {
        return Vec3.add(this.startingPos, Vec3.scalarProd(t, this.dir));
    }
}

},{"./Vec3":13}],9:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Color = require('./Color');
const Scene = require('./Scene');
const Ray = require('./Ray');

const EPSILON = 0.001;

module.exports = class Renderer {
    constructor(canvasElement) {
        this.selectScene(0);

        this.canvas = canvasElement;

        this.context = this.canvas.getContext('2d');

        // For debugging
        this.canvas.addEventListener('click', (evt) => {
            this._computeColorAtPos(evt.offsetX, evt.offsetY, true);
        });

        this.rendering = false;

        this.antialiasing = false;
        this.silhouetteRendering = false;
    }

    selectScene(idx) {
        this.scene = Scene[idx];
    }

    render() {
        if (!this.rendering) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.rendering = true;

            this._renderRow(0);
        }
    }

    _renderRow(y) {
        if (y >= this.canvas.height) {
            this.rendering = false;
            return;
        }

        for (let x = 0; x < this.canvas.width; x++) {
            const xRand = Math.random() * 0.25;
            const yRand = Math.random() * 0.25;

            let resultColor;

            if (this.antialiasing) {
                var r = 0, g = 0, b = 0;

                for (var yOffset = 0; yOffset < 0.99; yOffset += 0.25) {
                    for (var xOffset = 0; xOffset < 0.99; xOffset += 0.25) {
                        const xJitterPos = x + xOffset + xRand;
                        const yJitterPos = y + yOffset + yRand;

                        const sampleColor = this._computeColorAtPos(xJitterPos, yJitterPos);

                        if (sampleColor) {
                            r += sampleColor.r;
                            g += sampleColor.g;
                            b += sampleColor.b;
                        }
                    }
                }

                resultColor = new Color(r / 16, g / 16, b / 16);
            } else {
                resultColor = this._computeColorAtPos(x, y);
            }

            this.context.fillStyle = resultColor.toHexString();
            this.context.fillRect(x, y, 1, 1);
        }

        setTimeout(() => {
            this._renderRow(y + 1);
        }, 0);
    }

    _shade(intersect, debug) {
        var r = 0, g = 0, b = 0;

        for (let light of this.scene.lights) {
            const color = light.shade(intersect, this.scene.shapes, debug);

            r += color.r;
            g += color.g;
            b += color.b;
        }

        if (this.silhouetteRendering) {
            const cosViewNormal = Vec3.dot(intersect.rayDir, intersect.normal);

            if (Math.abs(cosViewNormal) < 0.4) {
                r = 0;
                g = 0;
                b = 0;
            }
        }

        return new Color(r, g, b);
    }

    _traceRay(ray, depth, envMap, debug) {
        let color;
        let minT = Number.MAX_VALUE;
        let closestIntersect;

        for (let shape of this.scene.shapes) {
            const intersect = shape.intersect(ray, debug);
            if (intersect && (intersect.t > EPSILON) && (intersect.t < minT)) {
                minT = intersect.t;
                closestIntersect = intersect;
            }
        }

        if (closestIntersect) {
            if (debug) {
                console.log(closestIntersect);
            }
            color = this._shade(closestIntersect, debug);

            const obj = closestIntersect.obj;
            const mat = obj.mat;

            if (depth < 6) {
                if (mat.isReflective) {
                    const reflRay = new Ray(closestIntersect.intersectionPoint, closestIntersect.reflDir);

                    const reflColor = this._traceRay(reflRay, depth + 1, envMap, debug);

                    if (reflColor) {
                        color.r += reflColor.r * mat.kReflective.r;
                        color.g += reflColor.g * mat.kReflective.g;
                        color.b += reflColor.b * mat.kReflective.b;
                    }
                }

                if (mat.isRefractive) {
                    const NL = -Vec3.dot(closestIntersect.normal, ray.dir);

                    var ior = mat.ior;

                    if (mat.iorMap) {
                        const width = mat.iorMap.width;
            			const height = mat.iorMap.height;

            			const x = Math.round(closestIntersect.texCoord.u * mat.iorMap.width);
            			const y = Math.round(closestIntersect.texCoord.v * mat.iorMap.height);

                        const idx = (y * width + x) * 4;

            			const iorColor = new Color(
            				(mat.iorMap.data[idx]) / 255,
            				(mat.iorMap.data[idx + 1]) / 255,
            				(mat.iorMap.data[idx + 2]) / 255
            			);

                        const iorGreyScale = iorColor.toGreyScale();

                        ior = 1.1 + iorGreyScale * 0.2;
                    }

                    var refrColor;

                    if (NL > 0) {
                        const pn = 1 / ior;

                        const longTerm = pn * NL - Math.sqrt(1 - pn * pn * (1 - NL * NL));

                        const refrDir = Vec3.add(
                            Vec3.scalarProd(longTerm, closestIntersect.normal),
                            Vec3.scalarProd(pn, ray.dir)
                        );

                        const refrRay = new Ray(closestIntersect.intersectionPoint, refrDir);
                        refrColor = this._traceRay(refrRay, depth + 1, envMap, debug);
                    } else {
                        const pn = ior;

                        const bSquare = 1 - pn * pn * (1 - NL * NL);

                        if (bSquare > 0) {
                            const longTerm = -(pn * (-NL) - Math.sqrt(bSquare));

                            const refrDir = Vec3.add(
                                Vec3.scalarProd(longTerm, closestIntersect.normal),
                                Vec3.scalarProd(pn, ray.dir)
                            );

                            const refrRay = new Ray(closestIntersect.intersectionPoint, refrDir);
                            refrColor = this._traceRay(refrRay, depth + 1, envMap, debug);
                        }
                    }

                    if (refrColor) {
                        const coeff = 1;
                        color.r += coeff * refrColor.r * mat.kRefractive.r;
                        color.g += coeff * refrColor.g * mat.kRefractive.g;
                        color.b += coeff * refrColor.b * mat.kRefractive.b;
                    }
                }
            }
        } else if (envMap) {
            const theta = Math.atan2(ray.dir.x, ray.dir.z);
            const phi = Math.PI * 0.5 - Math.acos(ray.dir.y);

            const u = (theta + Math.PI) * (0.5 / Math.PI);
            const v = 1 - 0.5 * (1 + Math.sin(phi));

            if (debug) {
                console.log(u, v);
                console.log(envMap);
            }

            const x = Math.round(u * envMap.width);
            const y = Math.round(v * envMap.height);

            const idx = (y * envMap.width + x) * 4;

            color = new Color(
                (envMap.data[idx]) / 255,
                (envMap.data[idx + 1]) / 255,
                (envMap.data[idx + 2]) / 255
            );
        }

        return color;
    }

    _computeColorAtPos(x, y, debug) {
        const crossPlaneWidth = 2;
        const crossPlaneHeight = crossPlaneWidth / this.canvas.width * this.canvas.height;

        const ratio = crossPlaneWidth / this.canvas.width;

        const zPos = 0;

        const xPos = -crossPlaneWidth / 2 + x * ratio;
        const yPos = -crossPlaneHeight / 2 + y * ratio;

        const ray = this.scene.camera.createRay(xPos, yPos);

        const color = this._traceRay(ray, 0, this.scene.envMap, debug);
        if (color) {
            color.clamp();
            return color;
        } else {
            return new Color(0, 0, 0);
        }
    }
}

},{"./Color":2,"./Ray":8,"./Scene":10,"./Vec3":13}],10:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Shape = require('./Shape');
const Color = require('./Color');
const QuadraticShape = require('./QuadraticShape');
const MeshObject = require('./MeshObject');
const Camera = require('./Camera');
const PointSpotLight = require('./PointSpotLight');
const DirectionalLight = require('./DirectionalLight');

function complexSquare(c) {
    return {
        real: c.real * c.real - c.imagine * c.imagine,
        imagine: 2 * c.real * c.imagine,
    };
}

function complexModSquare(c) {
    return c.real * c.real + c.imagine * c.imagine;
}

function complexAdd(c1, c2) {
    return {
        real: c1.real + c2.real,
        imagine: c1.imagine + c2.imagine,
    };
}

const materials = {
    juliaSetMat: {
        nSpecular: 20,
        kAmbient: new Color(0.1, 0.1, 0.1),
        specularThreshold: 0.8,
        proceduralTexture: (x, y, debug) => {
            const c = {
                real: -0.7,
                imagine: 0.27,
            };

            var z = {
                real: x,
                imagine: y,
            };

            var iter = 0;

            do {
                z = complexAdd(complexSquare(z), c);
                iter++;
                if (debug) {
                    console.log(x, y, z);
                }
            } while (complexModSquare(z) < 4 && iter < 30);

            return new Color(iter / 30, iter / 30, 1 - iter / 30);
        },
    },

    checkerboardMat: {
    	nSpecular: 20,
        kAmbient: new Color(0.1, 0.1, 0.1),
    	kSpecular: new Color(1, 1, 1),
    	diffuseMapSrc: 'cb.jpg',
    	specularThreshold: 0.8,
    },

    woodMat: {
    	nSpecular: 20,
        kAmbient: new Color(0.1, 0.1, 0.1),
    	kSpecular: new Color(1, 1, 1),
    	diffuseMapSrc: 'wood.jpg',
    	specularThreshold: 0.8,
    },

    shinyBlueMat: {
    	kAmbient: new Color(0.1, 0.1, 0.2),
    	kDiffuse: new Color(0.5, 0.5, 1),
    	kSpecular: new Color(0.3, 0.3, 0.6),
    	nSpecular: 20,
    	specularThreshold: 0.8,
    },

    shinyRedMat: {
    	kAmbient: new Color(0.2, 0.1, 0.1),
    	kDiffuse: new Color(1, 0.5, 0.5),
    	kSpecular: new Color(1, 0.5, 0.5),
    	nSpecular: 5,
    	specularThreshold: 0.95,
        normalMapSrc: 'plate.jpg',
    },

    dullRedMat: {
    	kAmbient: new Color(0.2, 0.1, 0.1),
    	kDiffuse: new Color(1, 0.5, 0.5),
    	kSpecular: new Color(0.2, 0.1, 0.1),
    	nSpecular: 100,
    	specularThreshold: 0.8,
    },

    dullGreenMat: {
    	kAmbient: new Color(0.1, 0.2, 0.1),
    	kDiffuse: new Color(0.5, 1, 0.5),
    	kSpecular: new Color(0.1, 0.2, 0.1),
    	nSpecular: 100,
    	specularThreshold: 0.8,
    },

    dullGreyMat: {
    	kAmbient: new Color(0.1, 0.1, 0.1),
    	kDiffuse: new Color(0.6, 0.6, 0.6),
    	kSpecular: new Color(0.1, 0.1, 0.1),
    	nSpecular: 100,
    	specularThreshold: 0.8,
    },

    shinyGreyMat: {
    	kAmbient: new Color(0.1, 0.1, 0.1),
    	kDiffuse: new Color(0.6, 0.6, 0.6),
    	kSpecular: new Color(0.6, 0.6, 0.6),
    	nSpecular: 20,
    	specularThreshold: 0.8,
    },

    treeMat: {
        kAmbient: new Color(0.1, 0.2, 0.1),
    	kDiffuse: new Color(0.5, 1, 0.5),
    	kSpecular: new Color(0.1, 0.2, 0.1),
    	nSpecular: 100,
    	specularThreshold: 0.8,
        smoothing: true,
    },

    reflectiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isReflective: true,
        kReflective: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
    },

    refractiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isRefractive: true,
        kRefractive: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
        ior: 1.2,
        transparency: 0.9,
    },

    normalReflectiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isReflective: true,
        kReflective: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
        normalMapSrc: 'plate.jpg',
    },

    normalRefractiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isRefractive: true,
        kRefractive: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
        normalMapSrc: 'normal.jpg',
        ior: 1.2,
        transparency: 0.9,
    },

    textureIORRefractiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isRefractive: true,
        kRefractive: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
        iorMapSrc: 'cb.jpg',
        ior: 1.2,
        transparency: 0.9,
    },
};

function loadTextureImage(src, cb) {
    const img = new Image();
    img.src = `img/${src}`;

    img.onload = () => {
        console.log("Texture loaded:", src);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        cb({
            width: img.width,
            height: img.height,
            data: ctx.getImageData(0, 0, img.width, img.height).data,
        });
    };
}

for (var matName in materials) {
    const mat = materials[matName];

    if (mat.diffuseMapSrc) {
        loadTextureImage(mat.diffuseMapSrc, textureData => {
            mat.diffuseMap = textureData;
        });
    }

    if (mat.normalMapSrc) {
        loadTextureImage(mat.normalMapSrc, textureData => {
            mat.normalMap = textureData;
        });
    }

    if (mat.iorMapSrc) {
        loadTextureImage(mat.iorMapSrc, textureData => {
            mat.iorMap = textureData;
        });
    }
}

const envMapSrc = "env.jpg";
let envMap;

loadTextureImage(envMapSrc, textureData => {
    console.log(`Env map loaded: ${envMapSrc}`);
    scene3.envMap = textureData;
});

const scene1 = {
    shapes: [
        new MeshObject(
            materials.shinyBlueMat,
            'cube',
            new Vec3(-0.5, -0.5, 5)
        ),
	    // sphere
        new MeshObject(
            materials.refractiveMat,
            'prism',
            new Vec3(0, -0.5, 2)
        ),
	    // bottom plane
	    new QuadraticShape(
            "bottom plane",
	        materials.shinyGreyMat,
	        new Vec3(0, -2, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // left plane
	    new QuadraticShape(
            "left plane",
	        materials.dullRedMat,
	        new Vec3(-3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // right plane
	    new QuadraticShape(
            "right plane",
	        materials.dullGreenMat,
	        new Vec3(3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(-1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // back plane
	    new QuadraticShape(
            "back plane",
	        materials.shinyGreyMat,
	        new Vec3(0, 0, 5),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // top plane
	    new QuadraticShape(
            "top plane",
	        materials.shinyGreyMat,
	        new Vec3(0, 3, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, -1, 0),
	        new Vec3(0, 0, 1),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	],

	lights: [
	    new PointSpotLight(
	        new Vec3(1, 2.5, -2),
	        new Vec3(-1, -2, 2),
			0,
			1,
	        new Color(1, 1, 1),
	        1
	    ),
	],

	camera: new Camera(
	    new Vec3(0, 0, -1),
	    new Vec3(0, 0, 1),
	    new Vec3(0, 1, 0),
	    1
	),
};

const scene2 = {
    shapes: [
        new MeshObject(
            materials.shinyBlueMat,
            'cube',
            new Vec3(-0.5, -0.5, 5)
        ),
        // Sphere
	    new QuadraticShape(
            "sphere",
	        materials.refractiveMat,
	        new Vec3(-1, 0, 2),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),
	    // bottom plane
	    new QuadraticShape(
            "bottom plane",
	        materials.shinyGreyMat,
	        new Vec3(0, -2, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // left plane
	    new QuadraticShape(
            "left plane",
	        materials.dullRedMat,
	        new Vec3(-3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // right plane
	    new QuadraticShape(
            "right plane",
	        materials.dullGreenMat,
	        new Vec3(3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(-1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // back plane
	    new QuadraticShape(
            "back plane",
	        materials.shinyGreyMat,
	        new Vec3(0, 0, 5),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // top plane
	    new QuadraticShape(
            "top plane",
	        materials.shinyGreyMat,
	        new Vec3(0, 3, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, -1, 0),
	        new Vec3(0, 0, 1),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	],

	lights: [
	    new PointSpotLight(
	        new Vec3(1, 2.5, -2),
	        new Vec3(-1, -2, 2),
			0,
			1,
	        new Color(1, 1, 1),
	        1
	    ),
	],

	camera: new Camera(
	    new Vec3(0, 0, -1),
	    new Vec3(0, 0, 1),
	    new Vec3(0, 1, 0),
	    1
	),
};

const scene3 = {
    shapes: [
        new MeshObject(
            materials.shinyBlueMat,
            'cube',
            new Vec3(-0.5, -0.5, 5)
        ),
	    // sphere
        new MeshObject(
            materials.normalRefractiveMat,
            'prism',
            new Vec3(0, 0.5, 2)
        ),
	    // bottom plane
	    new QuadraticShape(
            "bottom plane",
	        materials.shinyGreyMat,
	        new Vec3(0, -2, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // left plane
	    new QuadraticShape(
            "left plane",
	        materials.dullRedMat,
	        new Vec3(-3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // right plane
	    new QuadraticShape(
            "right plane",
	        materials.dullGreenMat,
	        new Vec3(3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(-1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // back plane
	    new QuadraticShape(
            "back plane",
	        materials.shinyGreyMat,
	        new Vec3(0, 0, 5),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // top plane
	    new QuadraticShape(
            "top plane",
	        materials.shinyGreyMat,
	        new Vec3(0, 3, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, -1, 0),
	        new Vec3(0, 0, 1),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	],

	lights: [
	    new PointSpotLight(
	        new Vec3(1, 2.5, -2),
	        new Vec3(-1, -2, 2),
			0,
			1,
	        new Color(1, 1, 1),
	        1
	    ),
	],

	camera: new Camera(
	    new Vec3(0, 0, -1),
	    new Vec3(0, 0, 1),
	    new Vec3(0, 1, 0),
	    1
	),
};

const scene4 = {
    shapes: [
        new MeshObject(
            materials.shinyBlueMat,
            'cube',
            new Vec3(-0.5, -0.5, 5)
        ),
	    // sphere
        new MeshObject(
            materials.textureIORRefractiveMat,
            'tex-cube',
            new Vec3(0, 0.5, -1)
        ),
	    // bottom plane
	    new QuadraticShape(
            "bottom plane",
	        materials.shinyGreyMat,
	        new Vec3(0, -2, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // left plane
	    new QuadraticShape(
            "left plane",
	        materials.dullRedMat,
	        new Vec3(-3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // right plane
	    new QuadraticShape(
            "right plane",
	        materials.dullGreenMat,
	        new Vec3(3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(-1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // back plane
	    new QuadraticShape(
            "back plane",
	        materials.shinyGreyMat,
	        new Vec3(0, 0, 5),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // top plane
	    new QuadraticShape(
            "top plane",
	        materials.shinyGreyMat,
	        new Vec3(0, 3, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, -1, 0),
	        new Vec3(0, 0, 1),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	],

	lights: [
	    new PointSpotLight(
	        new Vec3(1, 2.5, -2),
	        new Vec3(-1, -2, 2),
			0,
			1,
	        new Color(1, 1, 1),
	        1
	    ),
	],

	camera: new Camera(
	    new Vec3(0, 0, -1),
	    new Vec3(0, 0, 1),
	    new Vec3(0, 1, 0),
	    1
	),
};

module.exports = [scene1, scene2, scene3, scene4];

},{"./Camera":1,"./Color":2,"./DirectionalLight":3,"./MeshObject":5,"./PointSpotLight":6,"./QuadraticShape":7,"./Shape":11,"./Vec3":13}],11:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Shape {
    constructor(color) {
        this.color = color;
    }
}

},{"./Vec3":13}],12:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Triangle {
    constructor(vertices) {
        this.vertices = vertices;

        this.e1 = Vec3.subtract(vertices[1].pos, vertices[0].pos);
        this.e2 = Vec3.subtract(vertices[2].pos, vertices[0].pos);

        if (vertices[0].normal) {
            this.normal = vertices[0].normal;
        } else {
            this.normal = Vec3.normalize(Vec3.cross(this.e2, this.e1));
        }

        this.calculateTangentSpace();
    }

    calculateTangentSpace() {
        const v1 = this.vertices[0];
        const v2 = this.vertices[1];
        const v3 = this.vertices[2];

        const x1 = v2.pos.x - v1.pos.x;
        const y1 = v2.pos.y - v1.pos.y;
        const z1 = v2.pos.z - v1.pos.z;
        const x2 = v3.pos.x - v1.pos.x;
        const y2 = v3.pos.y - v1.pos.y;
        const z2 = v3.pos.z - v1.pos.z;

        if (v1.texCoord) {
            const s1 = v2.texCoord.x - v1.texCoord.x;
            const t1 = v2.texCoord.y - v1.texCoord.y;
            const s2 = v3.texCoord.x - v1.texCoord.x;
            const t2 = v3.texCoord.y - v1.texCoord.y;

            const r = 1 / (s1 * t2 - s2 * t1);

            this.tangent = Vec3.normalize(new Vec3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r));
            this.bitangent = Vec3.normalize(new Vec3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r));
        }

        // v1.tangent = sdir;
        // v2.tangent = sdir;
        // v3.tangent = sdir;
        //
        // v1.bitangent = tdir;
        // v2.bitangent = tdir;
        // v3.bitangent = tdir;
    }
}

},{"./Vec3":13}],13:[function(require,module,exports){
module.exports = class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    magnitude() {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y +
            this.z * this.z
        );
    }

    static normalize(v) {
        const mag = v.magnitude();

        return new Vec3(
            v.x / mag,
            v.y / mag,
            v.z / mag
        );
    }

    static add(...vs) {
        var xs = 0, ys = 0, zs = 0;

        for (let v of vs) {
            xs += v.x;
            ys += v.y;
            zs += v.z;
        }

        return new Vec3(xs, ys, zs);
    }

    static subtract(v1, v2) {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    static scalarProd(n, v) {
        return new Vec3(n * v.x, n * v.y, n * v.z);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static cross(v1, v2) {
        return new Vec3(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x
        );
    }
}

},{}],14:[function(require,module,exports){
const Renderer = require('./Renderer');

window.onload = () => {
    const canvasEl = document.getElementById('canvas');

    const renderer = new Renderer(canvasEl);

    setTimeout(() => {
        renderer.render();
    }, 500);

    $('#rerender-button').click(() => renderer.render());

	$('#antialiasing-toggle').bootstrapSwitch({
		onSwitchChange: (evt, state) => {
			renderer.antialiasing = state;
		}
	});

    $('#silhouette-toggle').bootstrapSwitch({
		onSwitchChange: (evt, state) => {
			renderer.silhouetteRendering = state;
		}
	});

    $('#scene-select').change((evt) => {
        const selectedIdx = $('#scene-select').val();
        renderer.selectScene(parseInt(selectedIdx) - 1);
    })


}

},{"./Renderer":9}]},{},[14]);
