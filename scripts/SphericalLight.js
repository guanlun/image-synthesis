const Vec3 = require('./Vec3');
const Light = require('./Light');
const Color = require('./Color');
const Ray = require('./Ray');

module.exports = class SphericalLight extends Light {
    constructor(position, radius, direction, angleCos, dropoffCoeff, color, intensity) {
		super(color, intensity);

		this.position = position;
        this.radius = radius;
		this.angleCos = angleCos;
		this.dropoffCoeff = dropoffCoeff;
		this.direction = Vec3.normalize(direction);

		this.daCoeff = 0.005;

        this.isAreaLight = true;
	}

    getDirection(pos) {
        return Vec3.normalize(Vec3.subtract(pos, this._getRandomLightPos()));
    }

    distanceAttenuation(pos) {
        const pToLight = Vec3.subtract(this.position, pos);
        const lightDist = pToLight.magnitude();
        return 1 / (1 + this.daCoeff * lightDist + this.daCoeff * lightDist * lightDist);
    }

	shadowAttenuation(pos, sceneShapes, debug) {
        var opacity = 1;
		const intersectToLight = Vec3.subtract(this._getRandomLightPos(), pos);
		const shadowRay = new Ray(pos, intersectToLight);
		const maxT = intersectToLight.magnitude();

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay);
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

    _getRandomLightPos() {
        const offset = new Vec3(
            (Math.random() - 0.5) * this.radius,
            (Math.random() - 0.5) * this.radius,
            (Math.random() - 0.5) * this.radius
        );

        return Vec3.add(this.position, offset);
    }
}
