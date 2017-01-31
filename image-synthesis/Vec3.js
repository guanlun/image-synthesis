define(["require", "exports"], function (require, exports) {
    "use strict";
    var Vec3 = (function () {
        function Vec3(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        Vec3.prototype.mag = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        };
        Vec3.add = function (v1, v2) {
            return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
        };
        Vec3.minus = function (v1, v2) {
            return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
        };
        Vec3.dot = function (v1, v2) {
            return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        };
        return Vec3;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Vec3;
});
//# sourceMappingURL=Vec3.js.map