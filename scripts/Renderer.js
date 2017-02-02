const Vec3 = require('./Vec3');
const Color = require('./Color');
const Sphere = require('./Sphere');
const Plane = require('./Plane');
const Cylinder = require('./Cylinder');

module.exports = class Renderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;

        this.context = this.canvas.getContext('2d');
    }

    render() {
        console.log(new Color(1, 0, 0).toHexString());
        const shapes = [
            new Sphere(
                new Vec3(0, 0, 0),
                0.5,
                new Color(1, 0, 0)
            ),
            new Plane(
                new Vec3(0, 0, -0.3),
                new Vec3(0.2, 1, 1),
                new Color(0, 0, 1)
            ),
            new Cylinder(
                new Vec3(0.5, 0.5, 0.5),
                new Vec3(-0.5, 0.5, 1),
                0.2,
                1,
                new Color(0, 1, 0)
            ),
        ];

        const zPos = 0;

        const crossPlaneWidth = 2;
        const crossPlaneHeight = crossPlaneWidth / this.canvas.width * this.canvas.height;

        const ratio = crossPlaneWidth / this.canvas.width;

        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const xRand = Math.random() * 0.25;
                const yRand = Math.random() * 0.25;

                let r = 0, g = 0, b = 0;

                for (let yOffset = 0; yOffset < 0.99; yOffset += 0.25) {
                    for (let xOffset = 0; xOffset < 0.99; xOffset += 0.25) {
                        const xJitterPos = x + xOffset + xRand;
                        const yJitterPos = y + yOffset + yRand;

                        const xPos = -crossPlaneWidth / 2 + xJitterPos * ratio;
                        const yPos = -crossPlaneHeight / 2 + yJitterPos * ratio;

                        const p = new Vec3(xPos, yPos, zPos);

                        let sampleColor = null;

                        for (let shapeIdx = 0; shapeIdx < shapes.length; shapeIdx++) {
                            const shape = shapes[shapeIdx];

                            if (shape.pointInside(p)) {
                                sampleColor = shape.color;
                                break;
                            }
                        }

                        if (sampleColor !== null) {
                            r += sampleColor.r;
                            g += sampleColor.g;
                            b += sampleColor.b;
                        }
                    }
                }

                const resultColor = new Color(r / 16, g / 16, b / 16);

                this.context.fillStyle = resultColor.toHexString();
                this.context.fillRect(x, y, 1, 1);
            }
        }
    }
}
