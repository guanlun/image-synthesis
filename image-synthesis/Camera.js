define(["require", "exports", "./Vec3", "./Ray"], function (require, exports, Vec3_1, Ray_1) {
    "use strict";
    var Camera = (function () {
        function Camera(position, forward) {
            this.position = position;
            this.forward = forward;
            console.log(this.forward);
        }
        Camera.prototype.render = function (context, sceneObjects) {
            for (var y = 0; y < 600; y++) {
                for (var x = 0; x < 800; x++) {
                    var camPlanePos = new Vec3_1.default(-1 + x / 400, -0.75 + y / 400, 0);
                    var ray = new Ray_1.default(this.position, Vec3_1.default.minus(camPlanePos, this.position));
                    var resultColor = ray.trace(sceneObjects);
                    context.fillStyle = resultColor.toHex();
                    context.fillRect(x, y, 1, 1);
                }
            }
        };
        return Camera;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Camera;
});
//# sourceMappingURL=Camera.js.map