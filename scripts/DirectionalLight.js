const Light = require('./Light');

module.exports = class DirectionalLight extends Light {
	constructor(color, intensity) {
		super(color, intensity);
	}
}