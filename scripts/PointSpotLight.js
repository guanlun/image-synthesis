const Vec3 = require('./Vec3');
const Light = require('./Light');
const Color = require('./Color');
const Ray = require('./Ray');

module.exports = class PointSpotLight extends Light {
	constructor(position, direction, angleCos, dropoffCoeff, color, intensity) {
		super(color, intensity);

		this.position = position;
		this.angleCos = angleCos;
		this.dropoffCoeff = dropoffCoeff;
		this.direction = Vec3.normalize(direction);

		this.daCoeff = 0.005;
	}

    getDirection(pos) {
        return Vec3.normalize(Vec3.subtract(pos, this.position));
    }

    distanceAttenuation(pos) {
        const pToLight = Vec3.subtract(this.position, pos);
        const lightDist = pToLight.magnitude();
        return 1 / (1 + this.daCoeff * lightDist + this.daCoeff * lightDist * lightDist);
    }

	shadowAttenuation(pos, sceneShapes, timeOffset, debug) {
        var opacity = 1;
		const intersectToLight = Vec3.subtract(this.position, pos);
		const shadowRay = new Ray(pos, intersectToLight);
		const maxT = intersectToLight.magnitude();

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay, timeOffset, debug);
			if (intersect && (intersect.t > 0.01) && (intersect.t < maxT)) {
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
