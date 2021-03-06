function clamp(n) {
    if (n > 1) return 1;
    if (n < 0) return 0;
    return n;
}

module.exports = class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.clamp();
    }

    clamp() {
        this.r = clamp(this.r);
        this.g = clamp(this.g);
        this.b = clamp(this.b);
    }

    toGreyScale() {
        return (this.r + this.g + this.b) / 3;
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
