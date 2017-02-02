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

    isInside(point) {
        const diff = Vec3.subtract(point, this.center);

        const axisDist = Vec3.dot(this.dir, diff);
        if (Math.abs(axisDist) > this.halfHeight) {
            return false;
        }

        const theta = Math.acos(axisDist / (this.dir.magnitude() * diff.magnitude()));
        const dist = Math.abs(Math.sin(theta) * diff.magnitude());

        if (dist < this.radius) {
            // console.log('ha');
        }

        return (dist < this.radius);
    }

    toHexString() {
        return 'cyan';
    }
}
