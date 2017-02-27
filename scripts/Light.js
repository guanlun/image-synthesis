const Color = require('./Color');

module.exports = class Light {
	constructor(color, intensity) {
		this.color = color;
		this.intensity = intensity;
	}

	diffuseLight(color, mat, cosTheta, texCoord, coeff) {
		if (coeff === undefined) {
			coeff = 1;
		}

		var diffuseColor;

		if (mat.diffuseMap) {
			const width = mat.diffuseMap.width;
			const height = mat.diffuseMap.height;

			const x = Math.round(texCoord.u * mat.diffuseMap.width);
			const y = Math.round(texCoord.v * mat.diffuseMap.height);

			const idx = (y * width + x) * 4;

			diffuseColor = new Color(
				(mat.diffuseMap.data[idx]) / 255,
				(mat.diffuseMap.data[idx + 1]) / 255,
				(mat.diffuseMap.data[idx + 2]) / 255
			);
		} else {
			diffuseColor = mat.kDiffuse;
		}

		color.r += coeff * this.intensity * diffuseColor.r * this.color.r * cosTheta;
		color.g += coeff * this.intensity * diffuseColor.b * this.color.g * cosTheta;
		color.b += coeff * this.intensity * diffuseColor.b * this.color.g * cosTheta;
	}
}
