const Vec3 = require('./Vec3');
const Shape = require('./Shape');

module.exports = class Sphere extends Shape {
    constructor(pos, radius, color) {
        super(color);
        this.pos = pos;
        this.radius = radius;
    }

    isInside(point) {
        const xDiff = this.pos.x - point.x;
        const yDiff = this.pos.y - point.y;
        const zDiff = this.pos.z - point.z;

        const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);

        return dist - this.radius < 0;
    }

    toHexString() {
        return 'blue';
    }
};
