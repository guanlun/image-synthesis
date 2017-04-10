const Vec3 = require('./Vec3');
const Color = require('./Color');
const Triangle = require('./Triangle');

const EPSILON = 0.0001;

module.exports = class MeshObject {
    constructor(mat, objName, offset, velocity) {
        this.mat = mat;

        this.velocity = velocity;

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
                        const pos = new Vec3(parseFloat(segs[1]), parseFloat(segs[2]), parseFloat(segs[3]));

                        if (offset) {
                            pos.x += offset.x;
                            pos.y += offset.y;
                            pos.z += offset.z;
                        }
                        this.vertices.push(pos);
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
                        });

                        this.faces.push(new Triangle(vertices));
                        break;
                }
            }
        });
    }

    intersect(ray, timeOffset, debug) {
        var minT = Number.MAX_VALUE;
        var intersect;

        for (let face of this.faces) {
            const vertices = face.vertices;

            const p = Vec3.cross(ray.dir, face.e2);
            const det = Vec3.dot(face.e1, p);

            if (det > -EPSILON && det < EPSILON) {
                continue;
            }

            const invDet = 1 / det;
            var firstVertexPos = vertices[0].pos;

            if (this.velocity) {
                firstVertexPos = Vec3.add(firstVertexPos, Vec3.scalarProd(timeOffset, this.velocity));
            }
            var t = Vec3.subtract(ray.startingPos, firstVertexPos);

            const u = Vec3.dot(t, p) * invDet;

            if (u < 0 || u > 1) {
                continue;
            }

            const q = Vec3.cross(t, face.e1);
            const v = Vec3.dot(ray.dir, q) * invDet;

            if (v < 0 || u + v > 1) {
                continue;
            }

            t = Vec3.dot(face.e2, q) * invDet;

            if (t < minT) {
                minT = t;

                var normal;

                if (this.mat.smoothing) {
                    normal = Vec3.add(
                        Vec3.scalarProd(u, vertices[1].normal),
                        Vec3.scalarProd(v, vertices[2].normal),
                        Vec3.scalarProd(1 - u - v, vertices[0].normal)
                    );
                } else {
                    normal = face.normal;
                }

                var texCoord;

                if (vertices[0].texCoord) {
                    const coords = Vec3.add(
                        Vec3.scalarProd(u, vertices[1].texCoord),
                        Vec3.scalarProd(v, vertices[2].texCoord),
                        Vec3.scalarProd(1 - u - v, vertices[0].texCoord)
                    );

                    texCoord = {
                        u: coords.x,
                        v: coords.y,
                    };
                }

                if (this.mat.normalMap) {
                    const width = this.mat.normalMap.width;
        			const height = this.mat.normalMap.height;

        			const x = Math.round(texCoord.u * this.mat.normalMap.width);
        			const y = Math.round(texCoord.v * this.mat.normalMap.height);

        			const idx = (y * width + x) * 4;

        			const normalMapColor = new Color(
        				(this.mat.normalMap.data[idx]) / 255,
        				(this.mat.normalMap.data[idx + 1]) / 255,
        				(this.mat.normalMap.data[idx + 2]) / 255
        			);

                    normal = Vec3.normalize(Vec3.add(
                        Vec3.scalarProd(normalMapColor.r, face.tangent),
                        Vec3.scalarProd(normalMapColor.g, face.bitangent),
                        Vec3.scalarProd(normalMapColor.b, normal)
                    ));
                }

        		const reflDir = Vec3.normalize(
        			Vec3.subtract(ray.dir,
        				Vec3.scalarProd(
        					2 * Vec3.dot(ray.dir, face.normal),
        					normal
        				)
        			)
        		);

                intersect = {
                    t: t,
                    rayDir: ray.dir,
        			intersectionPoint: ray.at(t),
                    normal: normal,
                    tangent: face.tangent,
                    bitangent: face.bitangent,
                    reflDir: reflDir,
                    obj: this,
                    texCoord: texCoord,
                };
            }
        }

        return intersect;
    }
}
