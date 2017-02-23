const Vec3 = require('./Vec3');
const Light = require('./Light');
const Color = require('./Color');
const Ray = require('./Ray');

const daCoeff = 0.005;

module.exports = class PointSpotLight extends Light {
	constructor(position, direction, angleCos, dropoffCoeff, color, intensity) {
		super(color, intensity);

		this.position = position;
		this.angleCos = angleCos;
		this.dropoffCoeff = dropoffCoeff;
		this.direction = Vec3.normalize(direction);
	}

	shadowAttenuation(pos, sceneShapes, debug) {
		const intersectToLight = Vec3.subtract(this.position, pos);
		const shadowRay = new Ray(pos, intersectToLight);
		const maxT = intersectToLight.magnitude();

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay);
			if (intersect && (intersect.t > 0.01) && (intersect.t < maxT)) {
				if (debug) {
					console.log('shadow', intersect.t, maxT);
				}
				return true;
			}
		}
	}

	shade(intersect, sceneShapes, debug) {
		let r = 0, g = 0, b = 0;

		const pos = intersect.intersectionPoint;

		if (this.shadowAttenuation(pos, sceneShapes, debug)) {
			return new Color(0, 0, 0);
		}

		const mat = intersect.obj.mat;

		r += 0.4 * this.intensity * mat.kAmbient.r * this.color.r;
		g += 0.4 * this.intensity * mat.kAmbient.g * this.color.g;
		b += 0.4 * this.intensity * mat.kAmbient.b * this.color.b;

		const pToLight = Vec3.subtract(this.position, pos);

		const pointLightCos = -Vec3.dot(this.direction, pToLight) / pToLight.magnitude();

		if (pointLightCos < this.angleCos) {
			// do nothing
		} else {
			const diffAngle = 1 - this.angleCos;
			const cutoff = 1 - diffAngle * (1 - this.dropoffCoeff);
			const spotLightAttenutation = 1 - Math.max(cutoff - pointLightCos, 0) / (diffAngle * this.dropoffCoeff);

			const lightDist = pToLight.magnitude();
			const distanceAttenuation = 1 / (1 + daCoeff * lightDist + daCoeff * lightDist * lightDist);

			const coeff = spotLightAttenutation * distanceAttenuation;

			const cosTheta = Vec3.dot(intersect.normal, pToLight) / pToLight.magnitude();
			if (cosTheta > 0) {
				r += coeff * this.intensity * mat.kDiffuse.r * this.color.r * cosTheta;
				g += coeff * this.intensity * mat.kDiffuse.g * this.color.g * cosTheta;
				b += coeff * this.intensity * mat.kDiffuse.b * this.color.b * cosTheta;
			}

			const specularCos = Vec3.dot(intersect.reflDir, pToLight) / pToLight.magnitude();
			if (specularCos > 0) {
				r += coeff * this.intensity * mat.kSpecular.r * this.color.r * Math.pow(specularCos, mat.nSpecular);
				g += coeff * this.intensity * mat.kSpecular.g * this.color.g * Math.pow(specularCos, mat.nSpecular);
				b += coeff * this.intensity * mat.kSpecular.b * this.color.b * Math.pow(specularCos, mat.nSpecular);
			}
		}

		return new Color(r, g, b);
	}
}
