const Vec3 = require('./Vec3');
const Shape = require('./Shape');

module.exports = class Plane extends Shape {
    constructor(pointOnPlane, normal, color) {
        super(color);

        this.pointOnPlane = pointOnPlane;
        this.normal = normal;
    }

    isInside(point) {
        const rel = Vec3.subtract(point, this.pointOnPlane);
        return Vec3.dot(rel, this.normal) < 0;
    }

    toHexString() {
        return 'red';
    }
}
