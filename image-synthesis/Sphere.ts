import Vec3 from './Vec3';
import Ray from './Ray';
import Color from './Color';
import { SceneObject } from './SceneObject';

export default class Sphere extends SceneObject {
    center: Vec3;
    radius: number;

    constructor(center: Vec3, radius: number, color: Color) {
        super(color);

        this.center = center;
        this.radius = radius;
    }

    intersect(ray: Ray): boolean {
        const lVec: Vec3 = Vec3.minus(this.center, ray.position);
        const lLen: number = lVec.mag();
        const dLen: number = ray.direction.mag();
        const theta: number = Math.acos(Vec3.dot(lVec, ray.direction) / (lLen * dLen));

        const dist = lLen * Math.sin(theta);

        return (dist <= this.radius);
    }
}