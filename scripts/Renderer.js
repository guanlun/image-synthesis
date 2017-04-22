const FileSaver = require('file-saver');

const Vec3 = require('./Vec3');
const Color = require('./Color');
const Scene = require('./Scene');
const Ray = require('./Ray');

const EPSILON = 0.001;

module.exports = class Renderer {
    constructor(canvasElement) {
        this.selectScene(1);

        this.outputDiv = document.getElementById('output');

        this.movingObj = this.scene.shapes[0];
        this.timeOffset = 0;

        this.canvas = canvasElement;

        this.context = this.canvas.getContext('2d');

        // For debugging
        this.canvas.addEventListener('click', (evt) => {
            this._computeColorAtPos(evt.offsetX, evt.offsetY, 0, true);
        });

        this.rendering = false;

        this.antialiasing = false;
        this.silhouetteRendering = false;

        this.frameNum = 0;
    }

    selectScene(idx) {
        this.scene = Scene[idx];
    }

    writeImage() {
        this.canvas.toBlob(blob => {
            var fileName = this.frameNum + ".jpg";
            if (this.frameNum < 10) {
                fileName = "0" + fileName;
            }
            FileSaver.saveAs(blob, fileName);

            this.frameNum++;
        });
    }

    nextFrame() {
        // this.timeOffset += 0.05;

        // this.writeImage();
        // this.render();
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

            setTimeout(this.nextFrame.bind(this), 0);
            return;
        }

        for (let x = 0; x < this.canvas.width; x++) {
            const jitterSamplePerSide = 3;
            const jitterCoeff = 1 / jitterSamplePerSide;
            const numSamples = jitterSamplePerSide * jitterSamplePerSide;

            const xRand = Math.random() * jitterCoeff;
            const yRand = Math.random() * jitterCoeff;

            let resultColor;

            if (this.antialiasing) {
                var r = 0, g = 0, b = 0;

                for (var yOffset = 0; yOffset < 0.99; yOffset += jitterCoeff) {
                    for (var xOffset = 0; xOffset < 0.99; xOffset += jitterCoeff) {
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

                resultColor = new Color(r / numSamples, g / numSamples, b / numSamples);
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

    _shade(intersect, debug) {
        var r = 0, g = 0, b = 0;

        for (let light of this.scene.lights) {
            if (light.isAreaLight) {
                const numSamples = 30;
                const fractionCoeff = 1 / numSamples;

                for (var i = 0; i < numSamples; i++) {
                    const sampleShadedColor = light.shade(intersect, this.scene.shapes, this.timeOffset, debug);

                    r += fractionCoeff * sampleShadedColor.r;
                    g += fractionCoeff * sampleShadedColor.g;
                    b += fractionCoeff * sampleShadedColor.b;
                }
            } else {
                const color = light.shade(intersect, this.scene.shapes, this.timeOffset, debug);

                r += color.r;
                g += color.g;
                b += color.b;
            }
        }

        if (this.silhouetteRendering) {
            const cosViewNormal = Vec3.dot(intersect.rayDir, intersect.normal);

            if (Math.abs(cosViewNormal) < 0.4) {
                r = 0;
                g = 0;
                b = 0;
            }
        }

        return new Color(r, g, b);
    }

    _traceRay(ray, depth, envMap, debug) {
        let color;
        let minT = Number.MAX_VALUE;
        let closestIntersect;

        for (let shape of this.scene.shapes) {
            const intersect = shape.intersect(ray, this.timeOffset, debug);
            if (intersect && (intersect.t > EPSILON) && (intersect.t < minT)) {
                minT = intersect.t;
                closestIntersect = intersect;
            }
        }

        if (closestIntersect) {
            if (debug) {
                console.log(closestIntersect);
            }
            color = this._shade(closestIntersect, debug);

            const obj = closestIntersect.obj;
            const mat = obj.mat;

            if (depth < 3) {
                const numSamples = 10;
                const fractionCoeff = 1 / numSamples;

                const scatterColor = new Color(0, 0, 0);

                for (var i = 0; i < numSamples; i++) {
                    const randScatterDir = Vec3.randomHemisphereDir(closestIntersect.normal);
                    const scatterRay = new Ray(closestIntersect.intersectionPoint, randScatterDir);

                    const sampleScatterColor = this._traceRay(scatterRay, depth + 1, envMap, debug);

                    if (sampleScatterColor) {
                        const indirectCoeff = 1;
                        scatterColor.r += indirectCoeff * fractionCoeff * sampleScatterColor.r;
                        scatterColor.g += indirectCoeff * fractionCoeff * sampleScatterColor.g;
                        scatterColor.b += indirectCoeff * fractionCoeff * sampleScatterColor.b;
                    }
                }

                color.r += scatterColor.r * mat.kDiffuse.r;
                color.g += scatterColor.g * mat.kDiffuse.g;
                color.b += scatterColor.b * mat.kDiffuse.b;
            }

            if (depth < 6) {
                if (mat.isReflective) {
                    var reflColor;

                    if (mat.isGlossy) {
                        reflColor = new Color(0, 0, 0);

                        const numSamples = 30;
                        const fractionCoeff = 1 / numSamples;

                        for (var i = 0; i < numSamples; i++) {
                            const randReflDir = Vec3.randomize(closestIntersect.reflDir, mat.glossiness);

                            const reflRay = new Ray(closestIntersect.intersectionPoint, randReflDir);

                            const sampleReflColor = this._traceRay(reflRay, depth + 1, envMap, debug);

                            if (sampleReflColor) {
                                reflColor.r += fractionCoeff * sampleReflColor.r;
                                reflColor.g += fractionCoeff * sampleReflColor.g;
                                reflColor.b += fractionCoeff * sampleReflColor.b;
                            }
                        }
                    } else {
                        const reflRay = new Ray(closestIntersect.intersectionPoint, closestIntersect.reflDir);

                        reflColor = this._traceRay(reflRay, depth + 1, envMap, debug);
                    }

                    if (reflColor) {
                        color.r += reflColor.r * mat.kReflective.r;
                        color.g += reflColor.g * mat.kReflective.g;
                        color.b += reflColor.b * mat.kReflective.b;
                    }
                }

                if (mat.isRefractive) {
                    var refrColor;

                    if (mat.isGlossy) {
                        refrColor = new Color(0, 0, 0);
                        const numSamples = 30;
                        const fractionCoeff = 1 / numSamples;

                        for (var i = 0; i < numSamples; i++) {
                            const sampleRefrColor = this._traceRefractiveRay(closestIntersect, ray, true, mat, envMap, depth + 1, debug);

                            if (sampleRefrColor) {
                                refrColor.r += fractionCoeff * mat.opacity * sampleRefrColor.r;
                                refrColor.g += fractionCoeff * mat.opacity * sampleRefrColor.g;
                                refrColor.b += fractionCoeff * mat.opacity * sampleRefrColor.b;
                            }
                        }
                    } else {
                        refrColor = this._traceRefractiveRay(closestIntersect, ray, false, mat, envMap, depth + 1, debug);
                    }

                    if (refrColor) {
                        const coeff = 1;
                        color.r += coeff * refrColor.r * mat.kRefractive.r;
                        color.g += coeff * refrColor.g * mat.kRefractive.g;
                        color.b += coeff * refrColor.b * mat.kRefractive.b;
                    }
                }
            }
        } else if (envMap) {
            const theta = Math.atan2(ray.dir.x, ray.dir.z);
            const phi = Math.PI * 0.5 - Math.acos(ray.dir.y);

            const u = (theta + Math.PI) * (0.5 / Math.PI);
            const v = 1 - 0.5 * (1 + Math.sin(phi));

            if (debug) {
                console.log(u, v);
                console.log(envMap);
            }

            const x = Math.round(u * envMap.width);
            const y = Math.round(v * envMap.height);

            const idx = (y * envMap.width + x) * 4;

            color = new Color(
                (envMap.data[idx]) / 255,
                (envMap.data[idx + 1]) / 255,
                (envMap.data[idx + 2]) / 255
            );
        }

        return color;
    }

    _traceRefractiveRay(intersect, ray, isGlossy, mat, envMap, depth, debug) {
        const NL = -Vec3.dot(intersect.normal, ray.dir);

        var ior = mat.ior;

        if (mat.iorMap) {
            const width = mat.iorMap.width;
            const height = mat.iorMap.height;

            const x = Math.round(intersect.texCoord.u * mat.iorMap.width);
            const y = Math.round(intersect.texCoord.v * mat.iorMap.height);

            const idx = (y * width + x) * 4;

            const iorColor = new Color(
                (mat.iorMap.data[idx]) / 255,
                (mat.iorMap.data[idx + 1]) / 255,
                (mat.iorMap.data[idx + 2]) / 255
            );

            const iorGreyScale = iorColor.toGreyScale();

            ior = 1.1 + iorGreyScale * 0.2;
        }

        var refrColor;

        if (NL > 0) {
            const pn = 1 / ior;

            const longTerm = pn * NL - Math.sqrt(1 - pn * pn * (1 - NL * NL));

            var refrDir = Vec3.add(
                Vec3.scalarProd(longTerm, intersect.normal),
                Vec3.scalarProd(pn, ray.dir)
            );

            if (isGlossy) {
                refrDir = Vec3.randomize(refrDir, mat.glossiness);
            }

            const refrRay = new Ray(intersect.intersectionPoint, refrDir);
            refrColor = this._traceRay(refrRay, depth + 1, envMap, debug);
        } else {
            const pn = ior;

            const bSquare = 1 - pn * pn * (1 - NL * NL);

            if (bSquare > 0) {
                const longTerm = -(pn * (-NL) - Math.sqrt(bSquare));

                var refrDir = Vec3.add(
                    Vec3.scalarProd(longTerm, intersect.normal),
                    Vec3.scalarProd(pn, ray.dir)
                );

                if (isGlossy) {
                    refrDir = Vec3.randomize(refrDir, mat.glossiness);
                }

                const refrRay = new Ray(intersect.intersectionPoint, refrDir);
                refrColor = this._traceRay(refrRay, depth + 1, envMap, debug);
            }
        }

        return refrColor;
    }

    _computeColorAtPos(x, y, debug) {
        const crossPlaneWidth = 2;
        const crossPlaneHeight = crossPlaneWidth / this.canvas.width * this.canvas.height;

        const ratio = crossPlaneWidth / this.canvas.width;

        const zPos = 0;

        const xPos = -crossPlaneWidth / 2 + x * ratio;
        const yPos = -crossPlaneHeight / 2 + y * ratio;

        const ray = this.scene.camera.createRay(xPos, yPos);

        const color = this._traceRay(ray, 0, this.scene.envMap, debug);

        if (color) {
            color.clamp();
            return color;
        } else {
            return new Color(0, 0, 0);
        }
    }
}
