const Vec3 = require('./Vec3');
const Color = require('./Color');
const QuadraticShape = require('./QuadraticShape');
const Sphere = require('./Sphere');
const Plane = require('./Plane');
const Cylinder = require('./Cylinder');
const Camera = require('./Camera');
const Ray = require('./Ray');
const Light = require('./Light');

const antialiasing = false;

const shapes = [
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
        new Color(0.7, 0.8, 1),
        new Vec3(-1, -1, 4),
        new Vec3(0, 0, 1),
        new Vec3(0, 1, 0),
        new Vec3(1, 0, 0),
        1.2, 1.2, 1.2,
        1, 1, 1, 0, -1
    ),
    // bottom plane
    new QuadraticShape(
        new Color(0.7, 0.7, 0.7),
        new Vec3(0, -2, 0),
        new Vec3(0, 0, 0),
        new Vec3(0, 1, 0),
        new Vec3(1, 0, 0),
        1, 1, 1,
        0, 0, 0, 1, 0
    ),
    // left plane
    new QuadraticShape(
        new Color(1, 0.7, 0.7),
        new Vec3(-3, 0, 0),
        new Vec3(0, 0, 0),
        new Vec3(1, 0, 0),
        new Vec3(0, 1, 0),
        1, 1, 1,
        0, 0, 0, 1, 0
    ),
    // right plane
    new QuadraticShape(
        new Color(0.7, 1, 0.7),
        new Vec3(3, 0, 0),
        new Vec3(0, 0, 0),
        new Vec3(-1, 0, 0),
        new Vec3(0, 1, 0),
        1, 1, 1,
        0, 0, 0, 1, 0
    ),
    // back plane
    new QuadraticShape(
        new Color(0.7, 0.7, 0.7),
        new Vec3(0, 0, 5),
        new Vec3(0, 0, 0),
        new Vec3(0, 0, -1),
        new Vec3(0, 1, 0),
        1, 1, 1,
        0, 0, 0, 1, 0
    ),
    // top plane
    new QuadraticShape(
        new Color(0.7, 0.7, 0.7),
        new Vec3(0, 3, 0),
        new Vec3(0, 0, 0),
        new Vec3(0, 1, 0),
        new Vec3(1, 0, 0),
        1, 1, 1,
        0, 0, 0, 1, 0
    ),
];

const lights = [
    new Light(
        new Vec3(0, 4, 1.5)
    ),
];

const camera = new Camera(
    new Vec3(0, 0, -1),
    new Vec3(0, 0, 1),
    new Vec3(0, 1, 0),
    1
);

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

        for (let light of lights) {
            const pToLight = Vec3.subtract(light.position, intersect.intersectionPoint);
            const cosTheta = Vec3.dot(intersect.normal, pToLight) / pToLight.magnitude();

            if (cosTheta > 0) {
                r += mat.r * cosTheta;
                g += mat.g * cosTheta;
                b += mat.b * cosTheta;
            }

            const specularCos = Vec3.dot(intersect.reflDir, pToLight) / pToLight.magnitude();
            if (specularCos > 0) {
                r += 1 * Math.pow(specularCos, 45);
                g += 1 * Math.pow(specularCos, 45);
                b += 1 * Math.pow(specularCos, 45);
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

        const ray = camera.createRay(xPos, yPos);

        let color;
        let minT = Number.MAX_VALUE;

        for (let shape of shapes) {
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
