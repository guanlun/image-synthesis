const Vec3 = require('./Vec3');
const Light = require('./Light');
const Color = require('./Color');

module.exports = class PointSpotLight extends Light {
	constructor(position, direction, angleCos, dropoffCoeff, color, intensity) {
		super(color, intensity);

		this.position = position;
		this.angleCos = angleCos;
		this.dropoffCoeff = dropoffCoeff;
		this.direction = Vec3.normalize(direction);
	}

	shade(intersect) {
		let r = 0, g = 0, b = 0;

		const mat = intersect.obj.mat;

		const pToLight = Vec3.subtract(this.position, intersect.intersectionPoint);

		const pointLightCos = -Vec3.dot(this.direction, pToLight) / pToLight.magnitude();

		if (pointLightCos < this.angleCos) {
			// do nothing
		} else {
			const distAngle = 1 - this.angleCos;
			const cutoff = 1 - distAngle * (1 - this.dropoffCoeff);
			const spotLightAttenutation = 1 - Math.max(cutoff - pointLightCos, 0) / (distAngle * this.dropoffCoeff);

			const cosTheta = Vec3.dot(intersect.normal, pToLight) / pToLight.magnitude();
			if (cosTheta > 0) {
				r += this.intensity * mat.kDiffuse.r * this.color.r * cosTheta;
				g += this.intensity * mat.kDiffuse.g * this.color.g * cosTheta;
				b += this.intensity * mat.kDiffuse.b * this.color.b * cosTheta;
			}

			const specularCos = Vec3.dot(intersect.reflDir, pToLight) / pToLight.magnitude();
			if (specularCos > 0) {
				r += this.intensity * mat.kDiffuse.r * this.color.r * Math.pow(specularCos, mat.nSpecular);
				g += this.intensity * mat.kDiffuse.g * this.color.g * Math.pow(specularCos, mat.nSpecular);
				b += this.intensity * mat.kDiffuse.b * this.color.b * Math.pow(specularCos, mat.nSpecular);
			}

			r *= spotLightAttenutation;
			g *= spotLightAttenutation;
			b *= spotLightAttenutation;
		}

		return new Color(r, g, b);
	}
}
