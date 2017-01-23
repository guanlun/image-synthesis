export default class Color {
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    toHex(): string {
        return `#${this.channelHex(this.r)}${this.channelHex(this.g)}${this.channelHex(this.b)}`;
    }

    channelHex(v: number): string {
        const hex = v.toString(16);

        if (hex.length == 1) {
            return '0' + hex;
        } else {
            return hex;
        }
    }
}