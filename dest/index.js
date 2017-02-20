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

},{"./Ray":7,"./Vec3":11}],2:[function(require,module,exports){
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
const Light = require('./Light');

module.exports = class DirectionalLight extends Light {
	constructor(color, intensity) {
		super(color, intensity);
	}
}
},{"./Light":4}],4:[function(require,module,exports){
module.exports = class Light {
	constructor(color, intensity) {
		this.color = color;
		this.intensity = intensity;
	}
}
},{}],5:[function(require,module,exports){
const Light = require('./Light');

module.exports = class PointSpotLight extends Light {
	constructor(position, color, intensity) {
		super(color, intensity);

		this.position = position;
	}
}
},{"./Light":4}],6:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class QuadraticShape {
	constructor(color, pCenter, p0, p1, v1, s0, s1, s2, a02, a12, a22, a21, a00) {
		this.color = color;
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

	intersect(ray) {
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

		return {
			t: t,
			rayDir: ray.dir,
			intersectionPoint: intersectionPoint,
			normal: normal,
			reflDir: reflDir,
			obj: this,
		}
	}
}
},{"./Vec3":11}],7:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Ray {
	constructor(startingPos, dir) {
		this.startingPos = startingPos;
		this.dir = Vec3.normalize(dir);
	}
}
},{"./Vec3":11}],8:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Color = require('./Color');
const Scene = require('./Scene');
const Ray = require('./Ray');
const antialiasing = false;

const toon = false;

module.exports = class Renderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;

        this.context = this.canvas.getContext('2d');

        // For debugging
        this.canvas.addEventListener('click', (evt) => {
            this._computeColorAtPos(evt.offsetX, evt.offsetY, true);
        });
    }

    render() {
        this._renderRow(0);
    }

    _renderRow(y) {
        if (y >= this.canvas.height) {
            return;
        }
        for (let x = 0; x < this.canvas.width; x++) {
            const xRand = Math.random() * 0.25;
            const yRand = Math.random() * 0.25;

            let resultColor;

            if (antialiasing) {
                let r = 0, g = 0, b = 0;

                for (let yOffset = 0; yOffset < 0.99; yOffset += 0.25) {
                    for (let xOffset = 0; xOffset < 0.99; xOffset += 0.25) {
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

    _shade(intersect) {
        const mat = intersect.obj.color;
        let r = 0.1, g = 0.1, b = 0.1;

        for (let light of Scene.lights) {
            const pToLight = Vec3.subtract(light.position, intersect.intersectionPoint);
            const cosTheta = Vec3.dot(intersect.normal, pToLight) / pToLight.magnitude();

            if (cosTheta > 0) {
                r += mat.r * cosTheta;
                g += mat.g * cosTheta;
                b += mat.b * cosTheta;
            }

            const specularCos = Vec3.dot(intersect.reflDir, pToLight) / pToLight.magnitude();
            if (specularCos > 0) {
                r += 0.25 * Math.pow(specularCos, 25);
                g += 0.25 * Math.pow(specularCos, 25);
                b += 0.25 * Math.pow(specularCos, 25);
            }
        }

        if (toon) {
            const cosViewNormal = Vec3.dot(intersect.rayDir, intersect.normal);

            if (Math.abs(cosViewNormal) < 0.3) {
                r *= 0.5;
                g *= 0.5;
                b *= 0.5;
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

        const ray = Scene.camera.createRay(xPos, yPos);

        let color;
        let minT = Number.MAX_VALUE;

        for (let shape of Scene.shapes) {
            const intersect = shape.intersect(ray);
            if (debug) {
                console.log(shape, intersect);
            }
            if (intersect && (intersect.t < minT)) {
                minT = intersect.t;
                color = this._shade(intersect);
            }
        }

        if (debug) {
            console.log('-------------------------------------');
        }

        return color || new Color(0, 0, 0);
    }
}

},{"./Color":2,"./Ray":7,"./Scene":9,"./Vec3":11}],9:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Shape = require('./Shape');
const Color = require('./Color');
const QuadraticShape = require('./QuadraticShape');
const Camera = require('./Camera');
const PointSpotLight = require('./PointSpotLight');
const DirectionalLight = require('./DirectionalLight');

module.exports = {
    shapes: [
	    // cylinder
	    new QuadraticShape(
	        new Color(0.9, 0.9, 0.9),
	        new Vec3(1.6, 1, 4),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        0.5, 0.5, 0.5,
	        1, 1, 0, 0, -1
	    ),
	    // sphere
	    new QuadraticShape(
	        new Color(0.5, 0.6, 1),
	        new Vec3(-1, -1, 4),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),
	    // bottom plane
	    new QuadraticShape(
	        new Color(0.8, 0.8, 0.8),
	        new Vec3(0, -2, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // left plane
	    new QuadraticShape(
	        new Color(1, 0.5, 0.5),
	        new Vec3(-3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // right plane
	    new QuadraticShape(
	        new Color(0.5, 1, 0.5),
	        new Vec3(3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(-1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // back plane
	    new QuadraticShape(
	        new Color(0.8, 0.8, 0.8),
	        new Vec3(0, 0, 5),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // top plane
	    new QuadraticShape(
	        new Color(0.8, 0.8, 0.8),
	        // new Color(1, 0, 0),
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
	        new Vec3(0, 2, 2),
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
}

},{"./Camera":1,"./Color":2,"./DirectionalLight":3,"./PointSpotLight":5,"./QuadraticShape":6,"./Shape":10,"./Vec3":11}],10:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Shape {
    constructor(color) {
        this.color = color;
    }
}

},{"./Vec3":11}],11:[function(require,module,exports){
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
        let xs = 0, ys = 0, zs = 0;

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

},{}],12:[function(require,module,exports){
const Renderer = require('./Renderer');

window.onload = () => {
    const canvasEl = document.getElementById('canvas');

    const renderer = new Renderer(canvasEl);
    renderer.render();
}

},{"./Renderer":8}]},{},[12]);
