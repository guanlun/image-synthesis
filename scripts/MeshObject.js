const Vec3 = require('./Vec3');

module.exports = class MeshObject {
    constructor(objData) {
        const lines = objData.split('\n');

        this.vertices = [];
        this.faces = [];

        for (let line of lines) {
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
                    })
            }
        }
    }

    intersect(ray) {
        for (let face in this.faces) {
            const vertices = face.vertices;
            const v1 = Vec3.subtract(vertices[1], vertices[0]);
            const v2 = Vec3.subtract(vertices[2], vertices[0]);

            
        }
    }
}
