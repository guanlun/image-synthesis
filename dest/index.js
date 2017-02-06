(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"./Shape":5,"./Vec3":7}],3:[function(require,module,exports){
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

},{"./Shape":5,"./Vec3":7}],4:[function(require,module,exports){
const Vec3 = require('./Vec3');
const Color = require('./Color');
const Sphere = require('./Sphere');
const Plane = require('./Plane');
const Cylinder = require('./Cylinder');

const antialiasing = true;

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

module.exports = class Renderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;

        this.context = this.canvas.getContext('2d');
    }

    render() {
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

        const p = new Vec3(xPos, yPos, zPos);

        for (let shapeIdx = 0; shapeIdx < shapes.length; shapeIdx++) {
            const shape = shapes[shapeIdx];

            if (shape.pointInside(p)) {
                return shape.color;
            }
        }

        return new Color(0, 0, 0);
    }
}

},{"./Color":1,"./Cylinder":2,"./Plane":3,"./Sphere":6,"./Vec3":7}],5:[function(require,module,exports){
const Vec3 = require('./Vec3');

module.exports = class Shape {
    constructor(color) {
        this.color = color;
    }
}

},{"./Vec3":7}],6:[function(require,module,exports){
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

},{"./Shape":5,"./Vec3":7}],7:[function(require,module,exports){
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

    static add(v1, v2) {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    static subtract(v1, v2) {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
}

},{}],8:[function(require,module,exports){
const Renderer = require('./Renderer');

window.onload = () => {
    const canvasEl = document.getElementById('canvas');

    const renderer = new Renderer(canvasEl);
    renderer.render();
}

},{"./Renderer":4}]},{},[8]);
