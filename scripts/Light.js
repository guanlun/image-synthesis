const Vec3 = require('./Vec3');
const Color = require('./Color');

module.exports = class Light {
	constructor(color, intensity) {
		this.color = color;
		this.intensity = intensity;
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

        const lightDir = this.getDirection(pos);

		// if (pointLightCos < this.angleCos) {
		// 	// do nothing
		// } else {
			const diffAngle = 1 - this.angleCos;
			const cutoff = 1 - diffAngle * (1 - this.dropoffCoeff);
			// const spotLightAttenutation = 1 - Math.max(cutoff - pointLightCos, 0) / (diffAngle * this.dropoffCoeff);

            const coeff = this.distanceAttenuation(pos);

			const cosTheta = -Vec3.dot(intersect.normal, lightDir);

			if (cosTheta > 0) {
				r += coeff * this.intensity * mat.kDiffuse.r * this.color.r * cosTheta;
				g += coeff * this.intensity * mat.kDiffuse.g * this.color.g * cosTheta;
				b += coeff * this.intensity * mat.kDiffuse.b * this.color.b * cosTheta;
			}

			const specularCos = -Vec3.dot(intersect.reflDir, lightDir);
			if (specularCos > 0) {
				r += coeff * this.intensity * mat.kSpecular.r * this.color.r * Math.pow(specularCos, mat.nSpecular);
				g += coeff * this.intensity * mat.kSpecular.g * this.color.g * Math.pow(specularCos, mat.nSpecular);
				b += coeff * this.intensity * mat.kSpecular.b * this.color.b * Math.pow(specularCos, mat.nSpecular);
			}
		// }

		return new Color(r, g, b);
	}

// 	diffuseLight(color, mat, cosTheta, specularCos, texCoord, coeff) {
// 		if (coeff === undefined) {
// 			coeff = 1;
// 		}
//
// 		var diffuseColor, specularColor;
//
// 		if (mat.diffuseMap) {
// 			const width = mat.diffuseMap.width;
// 			const height = mat.diffuseMap.height;
//
// 			const x = Math.round(texCoord.u * mat.diffuseMap.width);
// 			const y = Math.round(texCoord.v * mat.diffuseMap.height);
//
// 			const idx = (y * width + x) * 4;
//
// 			diffuseColor = new Color(
// 				(mat.diffuseMap.data[idx]) / 255,
// 				(mat.diffuseMap.data[idx + 1]) / 255,
// 				(mat.diffuseMap.data[idx + 2]) / 255
// 			);
// 			specularColor = diffuseColor;
// 		} else {
// 			diffuseColor = mat.kDiffuse;
//
// 		}
// 		specularColor = mat.kSpecular;
//
// 		const ns = Math.pow(specularCos, mat.nSpecular);
//
// 		color.r += coeff * this.intensity * this.color.r *
// 			(diffuseColor.r * cosTheta + specularColor.r * ns);
// 		color.g += coeff * this.intensity * this.color.g *
// 			(diffuseColor.g * cosTheta + specularColor.g * ns);
// 		color.b += coeff * this.intensity * this.color.b *
// 			(diffuseColor.b * cosTheta + specularColor.b * ns);
// 	}
}
