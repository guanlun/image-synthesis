module.exports = class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    magnitude() {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y +
            this.z * this.z
        );
    }

    static normalize(v) {
        const mag = v.magnitude();
        
        return new Vec3(
            v.x / mag,
            v.y / mag,
            v.z / mag
        );
    }

    static add(...vs) {
        let xs = 0, ys = 0, zs = 0;

        for (let v of vs) {
            xs += v.x;
            ys += v.y;
            zs += v.z;
        }

        return new Vec3(xs, ys, zs);
    }

    static subtract(v1, v2) {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    static scalarProd(n, v) {
        return new Vec3(n * v.x, n * v.y, n * v.z);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static cross(v1, v2) {
        return new Vec3(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x
        );
    }
}
