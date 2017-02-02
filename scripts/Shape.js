const Vec3 = require('./Vec3');

module.exports = class Shape {
    constructor(color) {
        this.color = color;
    }

    toHexString() {
        throw new Error('toHexString is not not implemented');
    }
}
