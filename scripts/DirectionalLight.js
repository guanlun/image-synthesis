const Vec3 = require('./Vec3');
const Light = require('./Light');
const Color = require('./Color');
const Ray = require('./Ray');

module.exports = class DirectionalLight extends Light {
	constructor(direction, color, intensity) {
		super(color, intensity);

		this.direction = Vec3.normalize(direction);

		this.daCoeff = 0;
	}

    getDirection(pos) {
        return this.direction;
    }

    distanceAttenuation(pos) {
        return 1;
    }

	shadowAttenuation(pos, sceneShapes, timeOffset, debug) {
        var opacity = 1;
		const shadowRay = new Ray(pos, Vec3.scalarProd(-1, this.direction));

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay, timeOffset, debug);
			if (intersect && (intersect.t > 0.001)) {
                if (shape.mat.transparency) {
                    opacity *= shape.mat.transparency;
                } else {
    				return 0;
                }
			}
		}

        return opacity;
	}
}
