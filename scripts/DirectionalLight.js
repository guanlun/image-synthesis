const Vec3 = require('./Vec3');
const Light = require('./Light');
const Color = require('./Color');

module.exports = class DirectionalLight extends Light {
	constructor(direction, color, intensity) {
		super(color, intensity);

		this.direction = Vec3.normalize(direction);
	}

	shade(intersect) {
		let r = 0, g = 0, b = 0;

		const mat = intersect.obj.mat;

		r += this.intensity * mat.kAmbient.r * this.color.r;
		g += this.intensity * mat.kAmbient.g * this.color.g;
		b += this.intensity * mat.kAmbient.b * this.color.b;

		const cosTheta = -Vec3.dot(intersect.normal, this.direction);
		if (cosTheta > 0) {
			r += this.intensity * mat.kDiffuse.r * this.color.r * cosTheta;
			g += this.intensity * mat.kDiffuse.g * this.color.g * cosTheta;
			b += this.intensity * mat.kDiffuse.b * this.color.b * cosTheta;
		}

		const specularCos = -Vec3.dot(intersect.reflDir, this.direction);
		if (specularCos > mat.specularThreshold) {
			r += this.intensity * mat.kSpecular.r * this.color.r * Math.pow(specularCos, mat.nSpecular);
			g += this.intensity * mat.kSpecular.g * this.color.g * Math.pow(specularCos, mat.nSpecular);
			b += this.intensity * mat.kSpecular.b * this.color.b * Math.pow(specularCos, mat.nSpecular);
		}

		return new Color(r, g, b);
	}
}
