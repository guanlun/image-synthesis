import Vec3 from './Vec3';
import Ray from './Ray';
import Color from './Color';
import Sphere from './Sphere';

export default class Camera {
    position: Vec3;
    forward: Vec3;

    constructor(position: Vec3, forward: Vec3) {
        this.position = position;
        this.forward = forward;

        console.log(this.forward);
    }

    render(context: CanvasRenderingContext2D, sceneObjects: Array<Sphere>): void {
        for (var y = 0; y < 600; y++) {
            for (var x = 0; x < 800; x++) {
                const camPlanePos: Vec3 = new Vec3(-1 + x / 400, -0.75 + y / 400, 0);

                const ray = new Ray(this.position, Vec3.minus(camPlanePos, this.position));
                const resultColor: Color = ray.trace(sceneObjects);

                context.fillStyle = resultColor.toHex();
                context.fillRect(x, y, 1, 1);
            }
        }
    }
}
