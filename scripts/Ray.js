const Vec3 = require('./Vec3');

module.exports = class Ray {
	constructor(startingPos, dir) {
		this.startingPos = startingPos;
		this.dir = Vec3.normalize(dir);
	}

    at(t) {
        return Vec3.add(this.startingPos, Vec3.scalarProd(t, this.dir));
    }
}
