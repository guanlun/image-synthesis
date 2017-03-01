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

	shadowAttenuation(pos, sceneShapes, debug) {
		const shadowRay = new Ray(pos, Vec3.scalarProd(-1, this.direction));

		for (let shape of sceneShapes) {
			const intersect = shape.intersect(shadowRay);
			if (intersect && (intersect.t > 0.01)) {
				return true;
			}
		}
	}

	// shade(intersect, sceneShapes, debug) {
	// 	var r = 0, g = 0, b = 0;
    //
	// 	const pos = intersect.intersectionPoint;
	// 	const mat = intersect.obj.mat;
    //
	// 	// r += this.intensity * mat.kAmbient.r * this.color.r;
	// 	// g += this.intensity * mat.kAmbient.g * this.color.g;
	// 	// b += this.intensity * mat.kAmbient.b * this.color.b;
    //
	// 	if (this.shadowAttenuation(pos, sceneShapes, debug)) {
	// 		return new Color(r, g, b);
	// 	}
    //
	// 	const cosTheta = -Vec3.dot(intersect.normal, this.direction);
	// 	if (cosTheta > 0) {
	// 		r += this.intensity * mat.kDiffuse.r * this.color.r * cosTheta;
	// 		g += this.intensity * mat.kDiffuse.g * this.color.g * cosTheta;
	// 		b += this.intensity * mat.kDiffuse.b * this.color.b * cosTheta;
	// 	}
    //
	// 	const specularCos = -Vec3.dot(intersect.reflDir, this.direction);
	// 	if (specularCos > mat.specularThreshold) {
	// 		r += this.intensity * mat.kSpecular.r * this.color.r * Math.pow(specularCos, mat.nSpecular);
	// 		g += this.intensity * mat.kSpecular.g * this.color.g * Math.pow(specularCos, mat.nSpecular);
	// 		b += this.intensity * mat.kSpecular.b * this.color.b * Math.pow(specularCos, mat.nSpecular);
	// 	}
    //
	// 	return new Color(r, g, b);
	// }
}
