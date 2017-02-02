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
        const shapes = [
            new Sphere(new Vec3(0, 0, 0), 0.5, new Color(0, 0, 0)),
            new Plane(new Vec3(0, 0, -0.3), new Vec3(0.2, 1, 1), new Color(255, 0, 255)),
            new Cylinder(new Vec3(0.5, 0.5, 0.5), new Vec3(-0.5, 0.5, 1), 0.2, 1)
        ];

        const zPos = 0;

        const crossPlaneWidth = 2;
        const crossPlaneHeight = crossPlaneWidth / this.canvas.width * this.canvas.height;

        const ratio = crossPlaneWidth / this.canvas.width;

        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const xPos = -crossPlaneWidth / 2 + x * ratio;
                const yPos = -crossPlaneHeight / 2 + y * ratio;

                const p = new Vec3(xPos, yPos, zPos);

                for (let shapeIdx = 0; shapeIdx < shapes.length; shapeIdx++) {
                    const shape = shapes[shapeIdx];
                    // console.log(shape);

                    if (shape.isInside(p)) {
                        this.context.fillStyle = shape.toHexString();
                        break;
                    } else {
                        this.context.fillStyle = 'white';
                    }
                }

                this.context.fillRect(x, y, 1, 1);
            }

        }

    }
}
