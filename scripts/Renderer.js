const Vec3 = require('./Vec3');
const Color = require('./Color');
const Scene = require('./Scene');
const Ray = require('./Ray');

module.exports = class Renderer {
    constructor(canvasElement) {
        this.selectScene(0);

        this.canvas = canvasElement;

        this.context = this.canvas.getContext('2d');

        // For debugging
        this.canvas.addEventListener('click', (evt) => {
            this._computeColorAtPos(evt.offsetX, evt.offsetY, true);
        });

        this.rendering = false;

        this.antialiasing = false;
        this.silhouetteRendering = false;
    }

    selectScene(idx) {
        this.scene = Scene[idx];
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
                var r = 0, g = 0, b = 0;

                for (var yOffset = 0; yOffset < 0.99; yOffset += 0.25) {
                    for (var xOffset = 0; xOffset < 0.99; xOffset += 0.25) {
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

    _shade(intersect, debug) {
        var r = 0, g = 0, b = 0;

        for (let light of this.scene.lights) {
            const color = light.shade(intersect, this.scene.shapes, debug);

            r += color.r;
            g += color.g;
            b += color.b;
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

        if (debug) {
            console.log(depth);
        }

        for (let shape of this.scene.shapes) {
            const intersect = shape.intersect(ray, debug);
            if (intersect && (intersect.t > 0) && (intersect.t < minT)) {
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

            if (mat.isReflective && (depth < 3)) {
                if (debug) {
                    console.log(closestIntersect);
                }

                const reflRay = new Ray(closestIntersect.intersectionPoint, closestIntersect.reflDir);

                const reflColor = this._traceRay(reflRay, depth + 1, envMap, debug);

                if (reflColor) {
                    const coeff = 0.5;
                    color.r += reflColor.r * mat.kReflective.r;
                    color.g += reflColor.g * mat.kReflective.g;
                    color.b += reflColor.b * mat.kReflective.b;
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

            // if (debug) {
            //     console.log(envColor);
            // }

            // color = envColor;
        }

        return color;
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
