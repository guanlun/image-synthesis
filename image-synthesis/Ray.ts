import Vec3 from './Vec3';
import Color from './Color';
import Sphere from './Sphere';

export default class Ray {
    position: Vec3;
    direction: Vec3;

    constructor(position: Vec3, direction: Vec3) {
        this.position = position;
        this.direction = direction;
    }

    trace(sceneObjects: Array<Sphere>): Color {
        for (let obj of sceneObjects) {
            if (obj.intersect(this)) {
                return new Color(0, 255, 0);
            }
        }
        return new Color(255, 165, 0);
    }
}