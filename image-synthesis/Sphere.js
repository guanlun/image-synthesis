var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Vec3", "./SceneObject"], function (require, exports, Vec3_1, SceneObject_1) {
    "use strict";
    var Sphere = (function (_super) {
        __extends(Sphere, _super);
        function Sphere(center, radius, color) {
            var _this = _super.call(this, color) || this;
            _this.center = center;
            _this.radius = radius;
            return _this;
        }
        Sphere.prototype.intersect = function (ray) {
            var lVec = Vec3_1.default.minus(this.center, ray.position);
            var lLen = lVec.mag();
            var dLen = ray.direction.mag();
            var theta = Math.acos(Vec3_1.default.dot(lVec, ray.direction) / (lLen * dLen));
            var dist = lLen * Math.sin(theta);
            return (dist <= this.radius);
        };
        return Sphere;
    }(SceneObject_1.SceneObject));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sphere;
});
//# sourceMappingURL=Sphere.js.map