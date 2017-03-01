const Vec3 = require('./Vec3');
const Shape = require('./Shape');
const Color = require('./Color');
const QuadraticShape = require('./QuadraticShape');
const MeshObject = require('./MeshObject');
const Camera = require('./Camera');
const PointSpotLight = require('./PointSpotLight');
const DirectionalLight = require('./DirectionalLight');

const texturedMat = {
	nSpecular: 20,
    kAmbient: new Color(0.1, 0.1, 0.1),
	kSpecular: new Color(1, 1, 1),
	diffuseMapSrc: 'cb.jpg',
	specularThreshold: 0.8,
};

const shinyBlueMat = {
	kAmbient: new Color(0.1, 0.1, 0.2),
	kDiffuse: new Color(0.5, 0.5, 1),
	kSpecular: new Color(0.3, 0.3, 0.6),
	nSpecular: 20,
	specularThreshold: 0.8,
};

const shinyRedMat = {
	kAmbient: new Color(0.2, 0.1, 0.1),
	kDiffuse: new Color(1, 0.5, 0.5),
	kSpecular: new Color(1, 0.5, 0.5),
	nSpecular: 5,
	specularThreshold: 0.95,
};

const dullRedMat = {
	kAmbient: new Color(0.2, 0.1, 0.1),
	kDiffuse: new Color(1, 0.5, 0.5),
	kSpecular: new Color(0.2, 0.1, 0.1),
	nSpecular: 100,
	specularThreshold: 0.8,
};

const dullGreenMat = {
	kAmbient: new Color(0.1, 0.2, 0.1),
	kDiffuse: new Color(0.5, 1, 0.5),
	kSpecular: new Color(0.1, 0.2, 0.1),
	nSpecular: 100,
	specularThreshold: 0.8,
};

const dullGreyMat = {
	kAmbient: new Color(0.1, 0.1, 0.1),
	kDiffuse: new Color(0.6, 0.6, 0.6),
	kSpecular: new Color(0.1, 0.1, 0.1),
	nSpecular: 100,
	specularThreshold: 0.8,
}

const shinyGreyMat = {
	kAmbient: new Color(0.1, 0.1, 0.1),
	kDiffuse: new Color(0.6, 0.6, 0.6),
	kSpecular: new Color(0.6, 0.6, 0.6),
	nSpecular: 20,
	specularThreshold: 0.8,
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
	        dullGreenMat,
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
	        new Vec3(1, 2.5, -2),
	        new Vec3(-1, -2, 2),
			0,
			1,
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
	        dullGreyMat,
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
	        new Vec3(2, 2, -2),
	        new Vec3(-0.5, -0.5, 1),
			0.9,
			0.8,
	        new Color(1, 1, 1),
	        1
	    ),
		new PointSpotLight(
	        new Vec3(-3, 3, -1),
	        new Vec3(0.7, -0.8, 1),
			0.95,
			0.1,
	        new Color(1, 1, 1),
	        0.3
	    ),
	],

	camera: new Camera(
	    new Vec3(0, 0, -1),
	    new Vec3(0, 0, 1),
	    new Vec3(0, 1, 0),
	    1
	),
};

const scene3 = {
	shapes: [
	    // sphere
	    new QuadraticShape(
	        shinyBlueMat,
	        new Vec3(-1, -2, 8),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),

	    // sphere
	    new QuadraticShape(
	        texturedMat,
	        new Vec3(1, 1, 6),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.5, 1.5, 1.5,
	        1, 1, 1, 0, -1
	    ),

	    // back plane
	    new QuadraticShape(
	        dullGreyMat,
	        new Vec3(0, 0, 10),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	],

	lights: [
	    new DirectionalLight(
	        new Vec3(-0.5, -0.5, 1),
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

module.exports = [scene1, scene2, scene3];
