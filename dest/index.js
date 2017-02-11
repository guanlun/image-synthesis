(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Camera {
    constructor(position, viewDir, upDir) {
        this.position = position;
        this.viewDir = viewDir;
        this.upDir = upDir;

        this.rightDir = Vec3.cross(upDir, viewDir);
    }
}

},{"./Vec3":10}],2:[function(require,module,exports){
module.exports = class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
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
const Shape = require('./Shape');

module.exports = class Cylinder extends Shape {
    constructor(center, dir, radius, halfHeight, color) {
        super(color);

        this.center = center;
        this.dir = dir;
        this.radius = radius;
        this.halfHeight = halfHeight;
    }

    pointInside(point) {
        const diff = Vec3.subtract(point, this.center);

        const axisDist = Vec3.dot(this.dir, diff);
        if (Math.abs(axisDist) > this.halfHeight) {
            return false;
        }

        const theta = Math.acos(axisDist / (this.dir.magnitude() * diff.magnitude()));
        const dist = Math.abs(Math.sin(theta) * diff.magnitude());

        return (dist < this.radius);
    }
}

},{"./Shape":8,"./Vec3":10}],4:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Shape = require('./Shape');

module.exports = class Plane extends Shape {
    constructor(pointOnPlane, normal, color) {
        super(color);

        this.pointOnPlane = pointOnPlane;
        this.normal = normal;
    }

    pointInside(point) {
        const rel = Vec3.subtract(point, this.pointOnPlane);
        return Vec3.dot(rel, this.normal) < 0;
    }
}

},{"./Shape":8,"./Vec3":10}],5:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class QuadraticShape {
	constructor(pCenter, p0, p1, v1, s0, s1, s2) {
		this.pCenter = pCenter;

		const v2 = Vec3.subtract(p1, p0);

		this.n2 = Vec3.normalize(v2);
		this.n0 = Vec3.normalize(Vec3.cross(v2, v1));
		this.n1 = Vec3.cross(this.n0, this.n2);

		this.s0 = s0;
		this.s1 = s1;
		this.s2 = s2;

		this.a02 = 1;
		this.a12 = 1;
		this.a22 = 1;
		this.a21 = 0;
		this.a00 = -1;
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

		const delta = Math.pow(B, 2) - 4 * A * C;

		if (delta < 0) {
			return;
		}

		return {
			t1: (-B - Math.sqrt(delta)) / (2 * A),
			t2: (-B + Math.sqrt(delta)) / (2 * A),
		}
	}
}
},{"./Vec3":10}],6:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Ray {
	constructor(startingPos, dir) {
		this.startingPos = startingPos;
		this.dir = dir;
	}
}
},{"./Vec3":10}],7:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Color = require('./Color');
const QuadraticShape = require('./QuadraticShape');
const Sphere = require('./Sphere');
const Plane = require('./Plane');
const Cylinder = require('./Cylinder');
const Camera = require('./Camera');
const Ray = require('./Ray');

const antialiasing = false;

const shapes = [
    new Sphere(
        new Vec3(-0.4, 0, 0),
        0.3,
        new Color(0.26, 0.53, 0.96)
    ),
    new Sphere(
        new Vec3(0.2, 0.3, 0),
        0.1,
        new Color(0.95, 0.81, 0.26)
    ),
    new Plane(
        new Vec3(0, 0, -0.3),
        new Vec3(0.2, 1, 1),
        new Color(0.65, 0.30, 0.76)
    ),
    new Cylinder(
        new Vec3(0.3, 0.4, 0.6),
        new Vec3(-0.5, 0.5, 1),
        0.2,
        1,
        new Color(0.40, 0.81, 0.51)
    ),
];

const qShape = new QuadraticShape(
    new Vec3(0, 0, 1),
    new Vec3(0, 0, -1),
    new Vec3(0, 0, 1),
    new Vec3(0, 1, 0),
    1, 1, 1
);

module.exports = class Renderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;

        this.context = this.canvas.getContext('2d');
    }

    render() {
        console.log(qShape)
        new Camera(
            new Vec3(0, 0, -1),
            new Vec3(0, 0, 1),
            new Vec3(0, 1, 0)
        );

        for (let y = 0; y < this.canvas.height; y++) {
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
        }
    }

    _computeColorAtPos(x, y) {
        const crossPlaneWidth = 2;
        const crossPlaneHeight = crossPlaneWidth / this.canvas.width * this.canvas.height;

        const ratio = crossPlaneWidth / this.canvas.width;

        const zPos = 0;

        const xPos = -crossPlaneWidth / 2 + x * ratio;
        const yPos = -crossPlaneHeight / 2 + y * ratio;


        const camPos = new Vec3(0, 0, -1);
        const ray = new Ray(
            camPos,
            Vec3.normalize(Vec3.subtract(new Vec3(xPos, yPos, 0), camPos))
        );

        if (qShape.intersect(ray)) {
            return new Color(1, 0, 0);
        }

        return new Color(1, 1, 0);
    }
}

},{"./Camera":1,"./Color":2,"./Cylinder":3,"./Plane":4,"./QuadraticShape":5,"./Ray":6,"./Sphere":9,"./Vec3":10}],8:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Shape {
    constructor(color) {
        this.color = color;
    }
}

},{"./Vec3":10}],9:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Shape = require('./Shape');

module.exports = class Sphere extends Shape {
    constructor(pos, radius, color) {
        super(color);
        this.pos = pos;
        this.radius = radius;
    }

    pointInside(point) {
        const xDiff = this.pos.x - point.x;
        const yDiff = this.pos.y - point.y;
        const zDiff = this.pos.z - point.z;

        const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);

        return dist - this.radius < 0;
    }
};

},{"./Shape":8,"./Vec3":10}],10:[function(require,module,exports){
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

    static add(v1, v2) {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    static subtract(v1, v2) {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
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

},{}],11:[function(require,module,exports){
const Renderer = require('./Renderer');

window.onload = () => {
    const canvasEl = document.getElementById('canvas');

    const renderer = new Renderer(canvasEl);
    renderer.render();
}

},{"./Renderer":7}]},{},[11]);
