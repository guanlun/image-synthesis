import Vec3 from './Vec3';
import Ray from './Ray';

export default class Sphere {
    center: Vec3;
    radius: number;

    constructor(center: Vec3, radius: number) {
        this.center = center;
        this.radius = radius;
    }

    intersect(ray: Ray) {
    }
}