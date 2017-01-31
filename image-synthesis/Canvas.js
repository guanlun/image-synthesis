define(["require", "exports", "./Vec3", "./Camera", "./Sphere", "./Color"], function (require, exports, Vec3_1, Camera_1, Sphere_1, Color_1) {
    "use strict";
    var Canvas = (function () {
        function Canvas(element) {
            this.context = element.getContext('2d');
            this.context.fillStyle = 'red';
            this.context.fillRect(0, 0, 100, 100);
            this.camera = new Camera_1.default(new Vec3_1.default(0, 0, -1), new Vec3_1.default(0, 0, 1));
            var sceneObjects = [
                new Sphere_1.default(new Vec3_1.default(0, 0, 10), 5, new Color_1.default(255, 0, 0))
            ];
            this.camera.render(this.context, sceneObjects);
        }
        return Canvas;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Canvas;
});
//# sourceMappingURL=Canvas.js.map