const Vec3 = require('./Vec3');
const Triangle = require('./Triangle');

const EPSILON = 0.0001;

module.exports = class MeshObject {
    constructor(mat, objName) {
        this.mat = mat;
        $.get(`/objects/${objName}.obj`, objData => {
            const lines = objData.split('\n');

            this.vertices = [];
            this.texCoords = [];
            this.normals = [];
            this.faces = [];

            for (let line of lines) {
                if (line[0] == '#' || line[0] == 'o') {
                    continue;
                }

                const segs = line.split(' ');
                const type = segs[0];

                switch (type) {
                    case 'v':
                        this.vertices.push(new Vec3(parseFloat(segs[1]), parseFloat(segs[2]), parseFloat(segs[3])));
                        break;
                    case 'vt':
                        this.texCoords.push(new Vec3(parseFloat(segs[1]), parseFloat(segs[2]), 0));
                        break;
                    case 'vn':
                        this.normals.push(new Vec3(parseFloat(segs[1]), parseFloat(segs[2]), parseFloat(segs[3])));
                        break;
                    case 'f':
                        const vertices = [];

                        segs.slice(1).forEach(seg => {
                            const [vi, ti, ni] = seg.split('/').map(n => parseInt(n) - 1);
                            vertices.push({
                                pos: this.vertices[vi],
                                texCoord: this.texCoords[ti],
                                normal: this.normals[ni],
                            });
                        })

                        this.faces.push(new Triangle(vertices));
                        break;
                }
            }
        });
    }

    intersect(ray, debug) {
        var minT = Number.MAX_VALUE;
        var intersect;

        for (let face of this.faces) {
            const vertices = face.vertices;
            const e1 = Vec3.subtract(vertices[1].pos, vertices[0].pos);
            const e2 = Vec3.subtract(vertices[2].pos, vertices[0].pos);

            const p = Vec3.cross(ray.dir, e2);
            const det = Vec3.dot(e1, p);

            if (det > -EPSILON && det < EPSILON) {
                continue;
            }

            const invDet = 1 / det;
            var t = Vec3.subtract(ray.startingPos, vertices[0].pos);

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

                const texCoord = Vec3.add(
                    Vec3.scalarProd(u, vertices[1].texCoord),
                    Vec3.scalarProd(v, vertices[2].texCoord),
                    Vec3.scalarProd(1 - u - v, vertices[0].texCoord)
                );

                intersect = {
                    t: t,
                    rayDir: ray.dir,
        			intersectionPoint: ray.at(t),
                    normal: Vec3.normalize(Vec3.cross(e2, e1)),
                    reflDir: Vec3.normalize(Vec3.cross(e2, e1)), // TODO
                    obj: this,
                    texCoord: {
                        u: texCoord.x,
                        v: texCoord.y,
                    }
                }
            }
        }

        return intersect;
    }
}
