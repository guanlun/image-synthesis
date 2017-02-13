const Vec3 = require('./Vec3');
const Ray = require('./Ray');

module.exports = class Camera {
    constructor(position, viewDir, upDir, fov) {
        this.position = position;
        this.viewDir = Vec3.normalize(viewDir);
        this.upDir = Vec3.normalize(upDir);
        this.fov = fov || 1;

        this.rightDir = Vec3.normalize(Vec3.cross(upDir, viewDir));
    }

    createRay(x, y) {
    	const xOffsetVec = Vec3.scalarProd(x * this.fov, this.rightDir);
    	const yOffsetVec = Vec3.scalarProd(-y * this.fov, this.upDir);
    	const offsetVec = Vec3.add(xOffsetVec, yOffsetVec);

    	return new Ray(
    		this.position,
    		Vec3.normalize(Vec3.add(this.viewDir, offsetVec))
		);
    }
}
