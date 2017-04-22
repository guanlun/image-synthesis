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
        var xs = 0, ys = 0, zs = 0;

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

    static randomize(v, r) {
        const rand1 = Math.random();
        const rand2 = Math.random();

        const x = Math.sqrt(- 2 * Math.log(rand1)) * Math.cos(2 * Math.PI * rand2) * r;
        const y = Math.sqrt(- 2 * Math.log(rand1)) * Math.sin(2 * Math.PI * rand2) * r;

        const u = new Vec3(v.x, v.y, v.z);

        // Create a vector not parallel to v
        u.x += 1;

        const e1 = Vec3.normalize(Vec3.cross(u, v));
        const e2 = Vec3.normalize(Vec3.cross(v, e1));

        return Vec3.normalize(Vec3.add(v, Vec3.scalarProd(x, e1), Vec3.scalarProd(y, e2)));
    }

    static randomHemisphereDir(normal) {
        const b = Vec3.normalize(new Vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5));

        if (Vec3.dot(b, normal) < 0) {
            b.x = -b.x;
            b.y = -b.y;
            b.z = -b.z;
        }

        return b;
    }
}
