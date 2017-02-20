const Vec3 = require('./Vec3');
const Light = require('./Light');

module.exports = class PointSpotLight extends Light {
	constructor(position, direction, color, intensity) {
		super(color, intensity);

		this.position = position;

		this.direction = Vec3.normalize(direction);
	}
}