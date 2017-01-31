define(["require", "exports", "./Color"], function (require, exports, Color_1) {
    "use strict";
    var Ray = (function () {
        function Ray(position, direction) {
            this.position = position;
            this.direction = direction;
        }
        Ray.prototype.trace = function (sceneObjects) {
            for (var _i = 0, sceneObjects_1 = sceneObjects; _i < sceneObjects_1.length; _i++) {
                var obj = sceneObjects_1[_i];
                if (obj.intersect(this)) {
                    return new Color_1.default(0, 255, 0);
                }
            }
            return new Color_1.default(255, 165, 0);
        };
        return Ray;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ray;
});
//# sourceMappingURL=Ray.js.map