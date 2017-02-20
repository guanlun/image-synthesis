const Vec3 = require('./Vec3');
const Shape = require('./Shape');
const Color = require('./Color');
const QuadraticShape = require('./QuadraticShape');
const Camera = require('./Camera');
const PointSpotLight = require('./PointSpotLight');
const DirectionalLight = require('./DirectionalLight');

const shinyBlueMat = {
	kAmbient: new Color(0.5, 0.5, 1),
	kDiffuse: new Color(0.5, 0.5, 1),
	kSpecular: new Color(1, 1, 1),
	nSpecular: 10,
};

const dullRedMat = {
	kAmbient: new Color(1, 0.5, 0.5),
	kDiffuse: new Color(1, 0.5, 0.5),
	kSpecular: new Color(0.2, 0.1, 0.1),
	nSpecular: 100,
};

const shinyGreyMat = {
	kAmbient: new Color(0.6, 0.6, 0.6),
	kDiffuse: new Color(0.6, 0.6, 0.6),
	kSpecular: new Color(0.6, 0.6, 0.6),
	nSpecular: 20,
};

const scene1 = {
	shapes: [
	    // cylinder
	    new QuadraticShape(
	        shinyGreyMat,
	        new Vec3(1.6, 1, 4),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        0.5, 0.5, 0.5,
	        1, 1, 0, 0, -1
	    ),
	    // sphere
	    new QuadraticShape(
	        shinyBlueMat,
	        new Vec3(-1, -1, 4),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),
	    // bottom plane
	    new QuadraticShape(
	        shinyGreyMat,
	        new Vec3(0, -2, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // left plane
	    new QuadraticShape(
	        dullRedMat,
	        new Vec3(-3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // right plane
	    new QuadraticShape(
	        dullRedMat,
	        new Vec3(3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(-1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // back plane
	    new QuadraticShape(
	        shinyGreyMat,
	        new Vec3(0, 0, 5),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // top plane
	    new QuadraticShape(
	        shinyGreyMat,
	        new Vec3(0, 3, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, -1, 0),
	        new Vec3(0, 0, 1),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	],

	lights: [
	    new PointSpotLight(
	        new Vec3(0, 2, 2),
	        new Vec3(-1, -1, 0),
	        new Color(1, 1, 1),
	        1
	    ),
	],

	camera: new Camera(
	    new Vec3(0, 0, -1),
	    new Vec3(0, 0, 1),
	    new Vec3(0, 1, 0),
	    1
	),
};

const scene2 = {
	shapes: [
	    // sphere
	    new QuadraticShape(
	        shinyBlueMat,
	        new Vec3(-1, -1, 4),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),

	    // sphere
	    new QuadraticShape(
	        dullRedMat,
	        new Vec3(1, 1, 6),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        1, 1, 1, 0, -1
	    ),

	    // back plane
	    new QuadraticShape(
	        shinyGreyMat,
	        new Vec3(0, 0, 10),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	],

	lights: [
	    new PointSpotLight(
	        new Vec3(0, 2, 2),
	        new Vec3(-1, -1, 0),
	        new Color(1, 1, 1),
	        1
	    ),
	],

	camera: new Camera(
	    new Vec3(0, 0, -1),
	    new Vec3(0, 0, 1),
	    new Vec3(0, 1, 0),
	    1
	),
};

module.exports = scene2;
