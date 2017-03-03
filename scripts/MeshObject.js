const Vec3 = require('./Vec3');

const EPSILON = 0.0001;

// class Face {
//     constructor() {
//
//     }
// }

module.exports = class MeshObject {
    constructor(mat, objName) {
        this.mat = mat;
        $.get(`/objects/${objName}.obj`, objData => {
            const lines = objData.split('\n');

            this.vertices = [];
            this.faces = [];

            for (let line of lines) {
                if (line[0] == '#' || line[0] == 'o') {
                    continue;
                }

                const segs = line.split(' ');
                const type = segs[0];

                const n1 = parseInt(segs[1]),
                    n2 = parseInt(segs[2]),
                    n3 = parseInt(segs[3]);

                switch (type) {
                    case 'v':
                        const vertex = new Vec3(n1, n2, n3);
                        this.vertices.push(vertex);
                        break;
                    case 'f':
                        this.faces.push({
                            vertices: [this.vertices[n1 - 1], this.vertices[n2 - 1], this.vertices[n3 - 1]],
                        });
                        break;
                }
            }
        });
    }

    intersect(ray) {
        var minT = Number.MAX_VALUE;
        var intersect;

        for (let face of this.faces) {
            const vertices = face.vertices;
            const e1 = Vec3.subtract(vertices[1], vertices[0]);
            const e2 = Vec3.subtract(vertices[2], vertices[0]);

            const p = Vec3.cross(ray.dir, e2);
            const det = Vec3.dot(e1, p);

            if (det > -EPSILON && det < EPSILON) {
                continue;
            }

            const invDet = 1 / det;
            var t = Vec3.subtract(ray.startingPos, vertices[0]);

            const u = Vec3.dot(t, p) * invDet;

            if (u < 0 || u > 1) {
                continue;
            }

            const q = Vec3.cross(t, e1);
            const v = Vec3.dot(ray.dir, q) * invDet;

            if (v < 0 || u + v > 1) {
                continue;
            }

            t = Vec3.dot(e2, q) * invDet;

            if (t < minT) {
                minT = t;

                intersect = {
                    t: t,
                    rayDir: ray.dir,
        			intersectionPoint: ray.at(t),
                    normal: Vec3.cross(e1, e2),
                    reflDir: Vec3.cross(e1, e2), // TODO
                    obj: this,
                }
            }
        }

        return intersect;
    }
}
