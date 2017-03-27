const Vec3 = require('./Vec3');

module.exports = class Triangle {
    constructor(vertices) {
        this.vertices = vertices;

        this.e1 = Vec3.subtract(vertices[1].pos, vertices[0].pos);
        this.e2 = Vec3.subtract(vertices[2].pos, vertices[0].pos);

        if (vertices[0].normal) {
            this.normal = vertices[0].normal;
        } else {
            this.normal = Vec3.normalize(Vec3.cross(this.e2, this.e1));
        }

        this.calculateTangentSpace();
    }

    calculateTangentSpace() {
        const v1 = this.vertices[0];
        const v2 = this.vertices[1];
        const v3 = this.vertices[2];

        const x1 = v2.pos.x - v1.pos.x;
        const y1 = v2.pos.y - v1.pos.y;
        const z1 = v2.pos.z - v1.pos.z;
        const x2 = v3.pos.x - v1.pos.x;
        const y2 = v3.pos.y - v1.pos.y;
        const z2 = v3.pos.z - v1.pos.z;

        if (v1.texCoord) {
            const s1 = v2.texCoord.x - v1.texCoord.x;
            const t1 = v2.texCoord.y - v1.texCoord.y;
            const s2 = v3.texCoord.x - v1.texCoord.x;
            const t2 = v3.texCoord.y - v1.texCoord.y;

            const r = 1 / (s1 * t2 - s2 * t1);

            this.tangent = Vec3.normalize(new Vec3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r));
            this.bitangent = Vec3.normalize(new Vec3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r));
        }

        // v1.tangent = sdir;
        // v2.tangent = sdir;
        // v3.tangent = sdir;
        //
        // v1.bitangent = tdir;
        // v2.bitangent = tdir;
        // v3.bitangent = tdir;
    }
}
