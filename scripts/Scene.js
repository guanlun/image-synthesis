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

    checkerboardMat: {
    	nSpecular: 20,
        kAmbient: new Color(0.1, 0.1, 0.1),
    	kSpecular: new Color(1, 1, 1),
    	diffuseMapSrc: 'cb.jpg',
    	specularThreshold: 0.8,
    },

    woodMat: {
    	nSpecular: 20,
        kAmbient: new Color(0.1, 0.1, 0.1),
    	kSpecular: new Color(1, 1, 1),
    	diffuseMapSrc: 'wood.jpg',
    	specularThreshold: 0.8,
    },

    shinyBlueMat: {
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
        normalMapSrc: 'plate.jpg',
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

    treeMat: {
        kAmbient: new Color(0.1, 0.2, 0.1),
    	kDiffuse: new Color(0.5, 1, 0.5),
    	kSpecular: new Color(0.1, 0.2, 0.1),
    	nSpecular: 100,
    	specularThreshold: 0.8,
        smoothing: true,
    },

    reflectiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isReflective: true,
        kReflective: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
    },

    glossyReflectiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isReflective: true,
        kReflective: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
        isGlossy: true,
    },

    refractiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isRefractive: true,
        kRefractive: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
        ior: 1.2,
        transparency: 0.9,
    },

    normalReflectiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isReflective: true,
        kReflective: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
        normalMapSrc: 'plate.jpg',
    },

    normalRefractiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isRefractive: true,
        kRefractive: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
        normalMapSrc: 'normal.jpg',
        ior: 1.2,
        transparency: 0.9,
    },

    textureIORRefractiveMat: {
        kAmbient: new Color(0.1, 0.1, 0.1),
        kDiffuse: new Color(0.1, 0.1, 0.1),
        kSpecular: new Color(1, 1, 1),
        isRefractive: true,
        kRefractive: new Color(0.7, 0.7, 0.7),
        nSpecular: 50,
        specularThreshold: 0.8,
        iorMapSrc: 'cb.jpg',
        ior: 1.2,
        transparency: 0.9,
    },
};

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

    if (mat.iorMapSrc) {
        loadTextureImage(mat.iorMapSrc, textureData => {
            mat.iorMap = textureData;
        });
    }
}

const envMapSrc = "env.jpg";
let envMap;

loadTextureImage(envMapSrc, textureData => {
    console.log(`Env map loaded: ${envMapSrc}`);
    scene3.envMap = textureData;
});

const scene1 = {
    shapes: [
        new MeshObject(
            materials.shinyBlueMat,
            'cube',
            new Vec3(-0.5, -0.5, 5)
        ),
	    // sphere
        new MeshObject(
            materials.glossyReflectiveMat,
            'prism',
            new Vec3(0, -0.5, 2)
        ),
	    // bottom plane
	    new QuadraticShape(
            "bottom plane",
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
            "left plane",
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
            "right plane",
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
            "back plane",
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
            "top plane",
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
        new MeshObject(
            materials.shinyBlueMat,
            'cube',
            new Vec3(-0.5, -0.5, 5)
        ),
        // Sphere
	    new QuadraticShape(
            "sphere",
	        materials.refractiveMat,
	        new Vec3(-1, 0, 2),
	        new Vec3(0, 0, 1),
	        new Vec3(0, 1, 0),
	        new Vec3(1, 0, 0),
	        1.2, 1.2, 1.2,
	        1, 1, 1, 0, -1
	    ),
	    // bottom plane
	    new QuadraticShape(
            "bottom plane",
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
            "left plane",
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
            "right plane",
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
            "back plane",
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
            "top plane",
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

const scene3 = {
    shapes: [
        new MeshObject(
            materials.shinyBlueMat,
            'cube',
            new Vec3(-0.5, -0.5, 5)
        ),
	    // sphere
        new MeshObject(
            materials.normalRefractiveMat,
            'prism',
            new Vec3(0, 0.5, 2)
        ),
	    // bottom plane
	    new QuadraticShape(
            "bottom plane",
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
            "left plane",
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
            "right plane",
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
            "back plane",
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
            "top plane",
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

const scene4 = {
    shapes: [
        new MeshObject(
            materials.shinyBlueMat,
            'cube',
            new Vec3(-0.5, -0.5, 5)
        ),
	    // sphere
        new MeshObject(
            materials.textureIORRefractiveMat,
            'tex-cube',
            new Vec3(0, 0.5, -1)
        ),
	    // bottom plane
	    new QuadraticShape(
            "bottom plane",
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
            "left plane",
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
            "right plane",
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
            "back plane",
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
            "top plane",
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

module.exports = [scene1, scene2, scene3, scene4];
