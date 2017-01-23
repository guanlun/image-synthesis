export default class Vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    mag(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    static add(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    static minus(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    static dot(v1: Vec3, v2: Vec3): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
}