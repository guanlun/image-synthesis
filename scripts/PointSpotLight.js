const Light = require('./Light');

module.exports = class PointSpotLight extends Light {
	constructor(position, color, intensity) {
		super(color, intensity);

		this.position = position;
	}
}