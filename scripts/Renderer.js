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
