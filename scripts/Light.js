const Vec3 = require('./Vec3');
const Color = require('./Color');

module.exports = class Light {
	constructor(color, intensity) {
		this.color = color;
		this.intensity = intensity;
	}

	shade(intersect, sceneShapes, debug) {
		const resultColor = new Color(0, 0, 0);

		const pos = intersect.intersectionPoint;
		const mat = intersect.obj.mat;

        const lightDir = this.getDirection(pos);

        const coeff = this.shadowAttenuation(pos, sceneShapes, debug) * this.distanceAttenuation(pos);

        const cosTheta = Math.max(0, -Vec3.dot(intersect.normal, lightDir));

        var ambientColor, diffuseColor, specularColor;
        if (mat.diffuseMap) {
            const width = mat.diffuseMap.width;
			const height = mat.diffuseMap.height;

			const x = Math.round(intersect.texCoord.u * mat.diffuseMap.width);
			const y = Math.round(intersect.texCoord.v * mat.diffuseMap.height);

			const idx = (y * width + x) * 4;

			diffuseColor = new Color(
				(mat.diffuseMap.data[idx]) / 255,
				(mat.diffuseMap.data[idx + 1]) / 255,
				(mat.diffuseMap.data[idx + 2]) / 255
			);
			specularColor = diffuseColor;
        } else if (mat.proceduralTexture) {
            diffuseColor = mat.proceduralTexture(intersect.texCoord.u, intersect.texCoord.v, debug);
            specularColor = diffuseColor;

            if (debug) {
                console.log(intersect);
            }

        } else {
            diffuseColor = mat.kDiffuse;
            specularColor = mat.kSpecular;
        }
        ambientColor = mat.kAmbient;

		const specularCos = Math.max(0, -Vec3.dot(intersect.reflDir, lightDir));
        const specularCoeff = Math.pow(specularCos, mat.nSpecular);

        resultColor.r += this.intensity * this.color.r *
            (ambientColor.r + coeff * (diffuseColor.r * cosTheta + specularColor.r * specularCoeff));
        resultColor.g += this.intensity * this.color.g *
            (ambientColor.g + coeff * (diffuseColor.g * cosTheta + specularColor.g * specularCoeff));
        resultColor.b += this.intensity * this.color.b *
            (ambientColor.b + coeff * (diffuseColor.b * cosTheta + specularColor.b * specularCoeff));

		return resultColor;
	}
}
