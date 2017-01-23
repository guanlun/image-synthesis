﻿import Vec3 from './Vec3';
import Camera from './Camera';
import Sphere from './Sphere';

export default class Canvas {
    context: CanvasRenderingContext2D;

    camera: Camera;

    constructor(element: HTMLCanvasElement) {
        this.context = element.getContext('2d');

        this.context.fillStyle = 'red';
        this.context.fillRect(0, 0, 100, 100);

        this.camera = new Camera(new Vec3(0, 0, -1), new Vec3(0, 0, 1));

        const sceneObjects: Array<Sphere> = [new Sphere(new Vec3(0, 0, 10), 5)];

        this.camera.render(this.context, sceneObjects);
    }
}