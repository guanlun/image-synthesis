const Vec3 = require('./Vec3');
const Shape = require('./Shape');
const Color = require('./Color');
const QuadraticShape = require('./QuadraticShape');
const MeshObject = require('./MeshObject');
const Camera = require('./Camera');
const PointSpotLight = require('./PointSpotLight');
const DirectionalLight = require('./DirectionalLight');

function complexSquare(c) {
    return {
        real: c.real * c.real - c.imagine * c.imagine,
        imagine: 2 * c.real * c.imagine,
    };
}

function complexModSquare(c) {
    return c.real * c.real + c.imagine * c.imagine;
}

function complexAdd(c1, c2) {
    return {
        real: c1.real + c2.real,
        imagine: c1.imagine + c2.imagine,
    };
}

const materials = {
    juliaSetMat: {
        nSpecular: 20,
        kAmbient: new Color(0.1, 0.1, 0.1),
        specularThreshold: 0.8,
        proceduralTexture: (x, y, debug) => {
            const c = {
                real: -0.7,
                imagine: 0.27,
            };

            var z = {
                real: x,
                imagine: y,
            };

            var iter = 0;

            do {
                z = complexAdd(complexSquare(z), c);
                iter++;
                if (debug) {
                    console.log(x, y, z);
                }
            } while (complexModSquare(z) < 4 && iter < 30);

            return new Color(iter / 30, iter / 30, 1 - iter / 30);
        },
    },

    perlinNoiseMat: {
        nSpecular: 20,
        kAmbient: new Color(0.1, 0.1, 0.1),
        specularThreshold: 0.8,
        proceduralTexture: (x, y, debug) => {
        },
    },

    texturedMat: {
    	nSpecular: 20,
        kAmbient: new Color(0.1, 0.1, 0.1),
    	kSpecular: new Color(1, 1, 1),
    	diffuseMapSrc: 'cb.jpg',
        normalMapSrc: 'normal.jpg',
    	specularThreshold: 0.8,
    },

    shinyBlueMat: {
        normalMapSrc: 'normal.jpg',
    	kAmbient: new Color(0.1, 0.1, 0.2),
    	kDiffuse: new Color(0.5, 0.5, 1),
    	kSpecular: new Color(0.3, 0.3, 0.6),
    	nSpecular: 20,
    	specularThreshold: 0.8,
    },

    shinyRedMat: {
    	kAmbient: new Color(0.2, 0.1, 0.1),
    	kDiffuse: new Color(1, 0.5, 0.5),
    	kSpecular: new Color(1, 0.5, 0.5),
    	nSpecular: 5,
    	specularThreshold: 0.95,
    },

    dullRedMat: {
    	kAmbient: new Color(0.2, 0.1, 0.1),
    	kDiffuse: new Color(1, 0.5, 0.5),
    	kSpecular: new Color(0.2, 0.1, 0.1),
    	nSpecular: 100,
    	specularThreshold: 0.8,
    },

    dullGreenMat: {
    	kAmbient: new Color(0.1, 0.2, 0.1),
    	kDiffuse: new Color(0.5, 1, 0.5),
    	kSpecular: new Color(0.1, 0.2, 0.1),
    	nSpecular: 100,
    	specularThreshold: 0.8,
    },

    dullGreyMat: {
    	kAmbient: new Color(0.1, 0.1, 0.1),
    	kDiffuse: new Color(0.6, 0.6, 0.6),
    	kSpecular: new Color(0.1, 0.1, 0.1),
    	nSpecular: 100,
    	specularThreshold: 0.8,
    },

    shinyGreyMat: {
    	kAmbient: new Color(0.1, 0.1, 0.1),
    	kDiffuse: new Color(0.6, 0.6, 0.6),
    	kSpecular: new Color(0.6, 0.6, 0.6),
    	nSpecular: 20,
    	specularThreshold: 0.8,
    },
};

// const textureLoadingStatus = {};

function loadTextureImage(src, cb) {
    const img = new Image();
    img.src = `img/${src}`;

    img.onload = () => {
        console.log("Texture loaded:", src);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        cb({
            width: img.width,
            height: img.height,
            data: ctx.getImageData(0, 0, img.width, img.height).data,
        });
    };
}

for (var matName in materials) {
    const mat = materials[matName];

    if (mat.diffuseMapSrc) {
        loadTextureImage(mat.diffuseMapSrc, textureData => {
            mat.diffuseMap = textureData;
        });
    }

    if (mat.normalMapSrc) {
        loadTextureImage(mat.normalMapSrc, textureData => {
            mat.normalMap = textureData;
        });
    }
}

const scene1 = {
	shapes: [
	    // cylinder
	    new QuadraticShape(
	        materials.shinyGreyMat,
	        new Vec3(1.6, 1, 4),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        0.5, 0.5, 0.5,
	        1, 1, 0, 0, -1
	    ),
	    // sphere
	    new QuadraticShape(
	        materials.shinyBlueMat,
	        new Vec3(-1, -1, 4),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),
	    // bottom plane
	    new QuadraticShape(
	        materials.shinyGreyMat,
	        new Vec3(0, -2, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // left plane
	    new QuadraticShape(
	        materials.dullRedMat,
	        new Vec3(-3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // right plane
	    new QuadraticShape(
	        materials.dullGreenMat,
	        new Vec3(3, 0, 0),
	        new Vec3(0, 0, 0),
	        new Vec3(-1, 0, 0),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // back plane
	    new QuadraticShape(
	        materials.shinyGreyMat,
	        new Vec3(0, 0, 5),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),
	    // top plane
	    new QuadraticShape(
	        materials.shinyGreyMat,
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
	        materials.shinyBlueMat,
	        new Vec3(-1, -1, 4),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),

	    // sphere
	    new QuadraticShape(
	        materials.dullRedMat,
	        new Vec3(1, 1, 6),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1, 1, 1,
	        1, 1, 1, 0, -1
	    ),

	    // back plane
	    new QuadraticShape(
	        materials.dullGreyMat,
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
	    // new QuadraticShape(
	    //     materials.juliaSetMat,
	    //     new Vec3(1, 1, 4),
	    //     new Vec3(0, 0, 1),
	    //     new Vec3(0, 1, 0),
	    //     new Vec3(1, 0, 0),
	    //     1.5, 1.5, 1.5,
	    //     1, 1, 1, 0, -1
	    // ),

	    // back plane
	    new QuadraticShape(
	        materials.dullGreyMat,
	        new Vec3(0, 0, 10),
	        new Vec3(0, 0, 0),
	        new Vec3(0, 0, -1),
	        new Vec3(0, 1, 0),
	        1, 1, 1,
	        0, 0, 0, 1, 0
	    ),

        new MeshObject(
            materials.shinyBlueMat,
            'plane'
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
