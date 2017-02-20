const Vec3 = require('./Vec3');
const Color = require('./Color');
const Scene = require('./Scene');
const Ray = require('./Ray');

module.exports = class Renderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;

        this.context = this.canvas.getContext('2d');

        // For debugging
        this.canvas.addEventListener('click', (evt) => {
            this._computeColorAtPos(evt.offsetX, evt.offsetY, true);
        });

        this.rendering = false;

        this.antialiasing = false;
        this.toon = false;
    }

    render() {
        if (!this.rendering) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.rendering = true;

            this._renderRow(0);
        }
    }

    _renderRow(y) {
        if (y >= this.canvas.height) {
            this.rendering = false;
            return;
        }
        for (let x = 0; x < this.canvas.width; x++) {
            const xRand = Math.random() * 0.25;
            const yRand = Math.random() * 0.25;

            let resultColor;

            if (this.antialiasing) {
                let r = 0, g = 0, b = 0;

                for (let yOffset = 0; yOffset < 0.99; yOffset += 0.25) {
                    for (let xOffset = 0; xOffset < 0.99; xOffset += 0.25) {
                        const xJitterPos = x + xOffset + xRand;
                        const yJitterPos = y + yOffset + yRand;

                        const sampleColor = this._computeColorAtPos(xJitterPos, yJitterPos);

                        if (sampleColor) {
                            r += sampleColor.r;
                            g += sampleColor.g;
                            b += sampleColor.b;
                        }
                    }
                }

                resultColor = new Color(r / 16, g / 16, b / 16);
            } else {
                resultColor = this._computeColorAtPos(x, y);
            }

            this.context.fillStyle = resultColor.toHexString();
            this.context.fillRect(x, y, 1, 1);
        }

        setTimeout(() => {
            this._renderRow(y + 1);
        }, 0);
    }

    _shade(intersect) {
        const mat = intersect.obj.mat;
        let r = 0.1, g = 0.1, b = 0.1;

        for (let light of Scene.lights) {
            const pToLight = Vec3.subtract(light.position, intersect.intersectionPoint);
            const cosTheta = Vec3.dot(intersect.normal, pToLight) / pToLight.magnitude();

            if (cosTheta > 0) {
                r += light.intensity * mat.kDiffuse.r * light.color.r * cosTheta;
                g += light.intensity * mat.kDiffuse.g * light.color.g * cosTheta;
                b += light.intensity * mat.kDiffuse.b * light.color.b * cosTheta;
            }

            const specularCos = Vec3.dot(intersect.reflDir, pToLight) / pToLight.magnitude();
            if (specularCos > 0) {
                r += light.intensity * mat.kDiffuse.r * light.color.r * Math.pow(specularCos, mat.nSpecular);
                g += light.intensity * mat.kDiffuse.g * light.color.g * Math.pow(specularCos, mat.nSpecular);
                b += light.intensity * mat.kDiffuse.b * light.color.b * Math.pow(specularCos, mat.nSpecular);
            }

            // const pointLightCos = -Vec3.dot(light.direction, pToLight);

            // if (pointLightCos < 1) {
            //     r *= pointLightCos;
            //     g *= pointLightCos;
            //     b *= pointLightCos;
            // }
        }

        if (this.toon) {
            const cosViewNormal = Vec3.dot(intersect.rayDir, intersect.normal);

            if (Math.abs(cosViewNormal) < 0.3) {
                r *= 0.5;
                g *= 0.5;
                b *= 0.5;
            }
        }

        return new Color(r, g, b);
    }

    _computeColorAtPos(x, y, debug) {
        const crossPlaneWidth = 2;
        const crossPlaneHeight = crossPlaneWidth / this.canvas.width * this.canvas.height;

        const ratio = crossPlaneWidth / this.canvas.width;

        const zPos = 0;

        const xPos = -crossPlaneWidth / 2 + x * ratio;
        const yPos = -crossPlaneHeight / 2 + y * ratio;

        const ray = Scene.camera.createRay(xPos, yPos);

        let color;
        let minT = Number.MAX_VALUE;

        for (let shape of Scene.shapes) {
            const intersect = shape.intersect(ray);
            if (debug) {
                console.log(shape, intersect);
            }
            if (intersect && (intersect.t < minT)) {
                minT = intersect.t;
                color = this._shade(intersect);
            }
        }

        if (debug) {
            console.log('-------------------------------------');
        }

        return color || new Color(0, 0, 0);
    }
}
