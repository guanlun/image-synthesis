import Ray from './Ray';
import Color from './Color';

export abstract class SceneObject {
    color: Color;

    constructor(color: Color) {
        this.color = color;
    }

    abstract intersect(ray: Ray): boolean;
}