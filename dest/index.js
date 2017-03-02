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

},{"./Ray":8,"./Vec3":12}],2:[function(require,module,exports){
function clamp(n) {
    if (n > 1) return 1;
    if (n < 0) return 0;
    return n;
}

module.exports = class Color {
    constructor(r, g, b) {
        this.r = clamp(r);
        this.g = clamp(g);
        this.b = clamp(b);
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
		const shadowRay = new Ray(pos, Vec3.scalarProd(-1, this.direction));

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay);
			if (intersect && (intersect.t > 0.01)) {
				return 0;
			}
		}

        return 1;
	}
}

},{"./Color":2,"./Light":4,"./Ray":8,"./Vec3":12}],4:[function(require,module,exports){
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
        } else {

            diffuseColor = mat.kDiffuse;
            specularColor = mat.kSpecular;
        }
        ambientColor = mat.kAmbient;

		const specularCos = Math.max(0, -Vec3.dot(intersect.reflDir, lightDir));
        const specularCoeff = Math.pow(specularCos, mat.nSpecular);

        resultColor.r += coeff * this.intensity * this.color.r *
            (ambientColor.r + coeff * (diffuseColor.r * cosTheta + specularColor.r * specularCoeff));
        resultColor.g += coeff * this.intensity * this.color.g *
            (ambientColor.g + coeff * (diffuseColor.g * cosTheta + specularColor.g * specularCoeff));
        resultColor.b += coeff * this.intensity * this.color.b *
            (ambientColor.b + coeff * (diffuseColor.b * cosTheta + specularColor.b * specularCoeff));

		return resultColor;
	}
}

},{"./Color":2,"./Vec3":12}],5:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class MeshObject {
    constructor(objName) {
        $.get(`/objects/${objName}.obj`, objData => {
            const lines = objData.split('\n');

            this.vertices = [];
            this.faces = [];

            for (let line of lines) {
                const segs = line.split(' ');
                const type = segs[0];

                const n1 = parseInt(segs[1]),
                    n2 = parseInt(segs[2]),
                    n3 = parseInt(segs[3]);

                switch (type) {
                    case 'v':
                        const vertex = new Vec3(n1, n2, n3);
                        this.vertices.push(vertex);
                        break;
                    case 'f':
                        this.faces.push({
                            vertices: [this.vertices[n1 - 1], this.vertices[n2 - 1], this.vertices[n3 - 1]],
                        })
                }
            }
        });
    }

    intersect(ray) {
        for (let face in this.faces) {
            const vertices = face.vertices;
            const v1 = Vec3.subtract(vertices[1], vertices[0]);
            const v2 = Vec3.subtract(vertices[2], vertices[0]);


        }
    }
}

},{"./Vec3":12}],6:[function(require,module,exports){
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
		const intersectToLight = Vec3.subtract(this.position, pos);
		const shadowRay = new Ray(pos, intersectToLight);
		const maxT = intersectToLight.magnitude();

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay);
			if (intersect && (intersect.t > 0.01) && (intersect.t < maxT)) {
				if (debug) {
					console.log('shadow', pos, intersectToLight, intersect.t, maxT);
				}
				return 0;
			}
		}

        return 1;
	}
}

},{"./Color":2,"./Light":4,"./Ray":8,"./Vec3":12}],7:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class QuadraticShape {
	constructor(mat, pCenter, p0, p1, v1, s0, s1, s2, a02, a12, a22, a21, a00) {
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

		if (this.mat.diffuseMapSrc !== undefined) {
			const img = new Image();
			img.src = `img/${mat.diffuseMapSrc}`;

			img.onload = () => {
				console.log("Texture loaded:", mat.diffuseMapSrc);

				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;

				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, img.width, img.height);

				this.mat.diffuseMap = {
					width: img.width,
					height: img.height,
					data: ctx.getImageData(0, 0, img.width, img.height).data,
				}
			};
		}
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

		const intersectionPoint = Vec3.add(ray.startingPos, Vec3.scalarProd(t, ray.dir));

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

		let u, v;

		if (this.mat.diffuseMap) {
			const tex0 = Vec3.dot(this.n0, relPos) / this.s0;
			const tex1 = Vec3.dot(this.n1, relPos) / this.s1;
			const tex2 = Vec3.dot(this.n2, relPos) / this.s2;

			v = Math.acos(tex2) / Math.PI;
			u = Math.acos(tex1 / Math.sin(Math.PI * v)) / (Math.PI * 2);
		}

		return {
			t: t,
			rayDir: ray.dir,
			intersectionPoint: intersectionPoint,
			normal: normal,
			reflDir: reflDir,
			obj: this,
			texCoord: {
				u: u,
				v: v,
			},
		}
	}
}

},{"./Vec3":12}],8:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Ray {
	constructor(startingPos, dir) {
		this.startingPos = startingPos;
		this.dir = Vec3.normalize(dir);
	}
}
},{"./Vec3":12}],9:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Color = require('./Color');
const Scene = require('./Scene');
const Ray = require('./Ray');

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

    _computeColorAtPos(x, y, debug) {
        const crossPlaneWidth = 2;
        const crossPlaneHeight = crossPlaneWidth / this.canvas.width * this.canvas.height;

        const ratio = crossPlaneWidth / this.canvas.width;

        const zPos = 0;

        const xPos = -crossPlaneWidth / 2 + x * ratio;
        const yPos = -crossPlaneHeight / 2 + y * ratio;

        const ray = this.scene.camera.createRay(xPos, yPos);

        let color;
        let minT = Number.MAX_VALUE;
        let closestIntersect;

        for (let shape of this.scene.shapes) {
            const intersect = shape.intersect(ray, debug);
            if (intersect && (intersect.t < minT)) {
                minT = intersect.t;
                closestIntersect = intersect;
            }
        }

        color = this._shade(closestIntersect, debug);

        if (debug) {
            console.log('-------------------------------------');
        }

        return color || new Color(0, 0, 0);
    }
}

},{"./Color":2,"./Ray":8,"./Scene":10,"./Vec3":12}],10:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Shape = require('./Shape');
const Color = require('./Color');
const QuadraticShape = require('./QuadraticShape');
const MeshObject = require('./MeshObject');
const Camera = require('./Camera');
const PointSpotLight = require('./PointSpotLight');
const DirectionalLight = require('./DirectionalLight');

const texturedMat = {
	nSpecular: 20,
    kAmbient: new Color(0.1, 0.1, 0.1),
	kSpecular: new Color(1, 1, 1),
	diffuseMapSrc: 'cb.jpg',
	specularThreshold: 0.8,
};

const shinyBlueMat = {
	kAmbient: new Color(0.1, 0.1, 0.2),
	kDiffuse: new Color(0.5, 0.5, 1),
	kSpecular: new Color(0.3, 0.3, 0.6),
	nSpecular: 20,
	specularThreshold: 0.8,
};

const shinyRedMat = {
	kAmbient: new Color(0.2, 0.1, 0.1),
	kDiffuse: new Color(1, 0.5, 0.5),
	kSpecular: new Color(1, 0.5, 0.5),
	nSpecular: 5,
	specularThreshold: 0.95,
};

const dullRedMat = {
	kAmbient: new Color(0.2, 0.1, 0.1),
	kDiffuse: new Color(1, 0.5, 0.5),
	kSpecular: new Color(0.2, 0.1, 0.1),
	nSpecular: 100,
	specularThreshold: 0.8,
};

const dullGreenMat = {
	kAmbient: new Color(0.1, 0.2, 0.1),
	kDiffuse: new Color(0.5, 1, 0.5),
	kSpecular: new Color(0.1, 0.2, 0.1),
	nSpecular: 100,
	specularThreshold: 0.8,
};

const dullGreyMat = {
	kAmbient: new Color(0.1, 0.1, 0.1),
	kDiffuse: new Color(0.6, 0.6, 0.6),
	kSpecular: new Color(0.1, 0.1, 0.1),
	nSpecular: 100,
	specularThreshold: 0.8,
}

const shinyGreyMat = {
	kAmbient: new Color(0.1, 0.1, 0.1),
	kDiffuse: new Color(0.6, 0.6, 0.6),
	kSpecular: new Color(0.6, 0.6, 0.6),
	nSpecular: 20,
	specularThreshold: 0.8,
};

const scene1 = {
	shapes: [
	    // cylinder
	    new QuadraticShape(
	        shinyGreyMat,
	        new Vec3(1.6, 1, 4),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        0.5, 0.5, 0.5,
	        1, 1, 0, 0, -1
	    ),
	    // sphere
	    new QuadraticShape(
	        shinyBlueMat,
	        new Vec3(-1, -1, 4),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),
	    // bottom plane
	    new QuadraticShape(
	        shinyGreyMat,
	        new Vec3(0, -2, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // left plane
	    new QuadraticShape(
	        dullRedMat,
	        new Vec3(-3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // right plane
	    new QuadraticShape(
	        dullGreenMat,
	        new Vec3(3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(-1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // back plane
	    new QuadraticShape(
	        shinyGreyMat,
	        new Vec3(0, 0, 5),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // top plane
	    new QuadraticShape(
	        shinyGreyMat,
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
	    // sphere
	    new QuadraticShape(
	        shinyBlueMat,
	        new Vec3(-1, -1, 4),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),

	    // sphere
	    new QuadraticShape(
	        dullRedMat,
	        new Vec3(1, 1, 6),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        1, 1, 1, 0, -1
	    ),

	    // back plane
	    new QuadraticShape(
	        dullGreyMat,
	        new Vec3(0, 0, 10),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	],

	lights: [
	    new PointSpotLight(
	        new Vec3(2, 2, -2),
	        new Vec3(-0.5, -0.5, 1),
			0.9,
			0.8,
	        new Color(1, 1, 1),
	        1
	    ),
		new PointSpotLight(
	        new Vec3(-3, 3, -1),
	        new Vec3(0.7, -0.8, 1),
			0.95,
			0.1,
	        new Color(1, 1, 1),
	        0.3
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
	    // sphere
	    new QuadraticShape(
	        shinyBlueMat,
	        new Vec3(-1, -2, 8),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),

	    // sphere
	    new QuadraticShape(
	        texturedMat,
	        new Vec3(1, 1, 6),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.5, 1.5, 1.5,
	        1, 1, 1, 0, -1
	    ),

	    // back plane
	    new QuadraticShape(
	        texturedMat,
	        new Vec3(0, 0, 10),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),

        new MeshObject(
            'plane'
        ),
	],

	lights: [
	    new DirectionalLight(
	        new Vec3(-0.5, -0.5, 1),
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

module.exports = [scene1, scene2, scene3];

},{"./Camera":1,"./Color":2,"./DirectionalLight":3,"./MeshObject":5,"./PointSpotLight":6,"./QuadraticShape":7,"./Shape":11,"./Vec3":12}],11:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Shape {
    constructor(color) {
        this.color = color;
    }
}

},{"./Vec3":12}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./Renderer":9}]},{},[13]);
