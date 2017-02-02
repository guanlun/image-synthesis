module.exports = class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    toHexString() {
        return `#${this.channelHex(this.r)}${this.channelHex(this.g)}${this.channelHex(this.b)}`;
    }

    channelHex(v) {
        const intVal = Math.floor(v * 255);
        const hex = intVal.toString(16);

        if (hex.length === 1) {
            return '0' + hex;
        } else {
            return hex;
        }
    }
}
