const Vec3 = require('./Vec3');

module.exports = class Camera {
    constructor(position, viewDir, upDir) {
        this.position = position;
        this.viewDir = viewDir;
        this.upDir = upDir;

        this.rightDir = Vec3.cross(upDir, viewDir);
    }
}
