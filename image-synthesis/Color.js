define(["require", "exports"], function (require, exports) {
    "use strict";
    var Color = (function () {
        function Color(r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
        Color.prototype.toHex = function () {
            return "#" + this.channelHex(this.r) + this.channelHex(this.g) + this.channelHex(this.b);
        };
        Color.prototype.channelHex = function (v) {
            var hex = v.toString(16);
            if (hex.length == 1) {
                return '0' + hex;
            }
            else {
                return hex;
            }
        };
        return Color;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Color;
});
//# sourceMappingURL=Color.js.map