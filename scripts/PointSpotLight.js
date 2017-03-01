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

	shadowAttenuation(pos, sceneShapes, debug) {
		const intersectToLight = Vec3.subtract(this.position, pos);
		const shadowRay = new Ray(pos, intersectToLight);
		const maxT = intersectToLight.magnitude();

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay);
			if (intersect && (intersect.t > 0.01) && (intersect.t < maxT)) {
				if (debug) {
					console.log('shadow', pos, intersectToLight, intersect.t, maxT);
				}
				return true;
			}
		}
	}

	computeCosTheta() {

	}

	// shade(intersect, sceneShapes, debug) {
	// 	const resultColor = new Color(0, 0, 0);
    //
	// 	const pos = intersect.intersectionPoint;
	// 	const mat = intersect.obj.mat;
    //
	// 	// resultColor.r += this.intensity * mat.kAmbient.r * this.color.r;
	// 	// resultColor.g += this.intensity * mat.kAmbient.g * this.color.g;
	// 	// resultColor.b += this.intensity * mat.kAmbient.b * this.color.b;
    //
	// 	if (this.shadowAttenuation(pos, sceneShapes, debug)) {
	// 		return resultColor;
	// 	}
    //
	// 	const pToLight = Vec3.subtract(this.position, pos);
    //
	// 	const pointLightCos = -Vec3.dot(this.direction, pToLight) / pToLight.magnitude();
    //
	// 	if (pointLightCos < this.angleCos) {
	// 		// do nothing
	// 	} else {
	// 		const diffAngle = 1 - this.angleCos;
	// 		const cutoff = 1 - diffAngle * (1 - this.dropoffCoeff);
	// 		const spotLightAttenutation = 1 - Math.max(cutoff - pointLightCos, 0) / (diffAngle * this.dropoffCoeff);
    //
	// 		const lightDist = pToLight.magnitude();
	// 		const distanceAttenuation = 1 / (1 + this.daCoeff * lightDist + this.daCoeff * lightDist * lightDist);
    //
	// 		const coeff = spotLightAttenutation * distanceAttenuation;
    //
	// 		const cosTheta = Math.max(0, Vec3.dot(intersect.normal, pToLight) / pToLight.magnitude());
	// 		const specularCos = Math.max(0, Vec3.dot(intersect.reflDir, pToLight) / pToLight.magnitude());
    //
	// 		this.diffuseLight(resultColor, mat, cosTheta, specularCos, intersect.texCoord, coeff);
	// 	}
    //
	// 	return resultColor;
	// }
}
