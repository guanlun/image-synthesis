const Vec3 = require('./Vec3');

module.exports = class QuadraticShape {
	constructor(mat, pCenter, p0, p1, v1, s0, s1, s2, a02, a12, a22, a21, a00) {
		this.mat = mat;
		this.pCenter = pCenter;

		const v2 = Vec3.subtract(p1, p0);

		this.n2 = Vec3.normalize(v2);
		this.n0 = Vec3.normalize(Vec3.cross(v2, v1));
		this.n1 = Vec3.cross(this.n0, this.n2);

		this.s0 = s0;
		this.s1 = s1;
		this.s2 = s2;

		this.a02 = a02;
		this.a12 = a12;
		this.a22 = a22;
		this.a21 = a21;
		this.a00 = a00;
	}

	intersect(ray, debug) {
		const pe0 = Vec3.dot(this.n0, ray.dir) / this.s0;
		const pe1 = Vec3.dot(this.n1, ray.dir) / this.s1;
		const pe2 = Vec3.dot(this.n2, ray.dir) / this.s2;

		const camToCenter = Vec3.subtract(ray.startingPos, this.pCenter);

		const ec0 = Vec3.dot(this.n0, camToCenter) / this.s0;
		const ec1 = Vec3.dot(this.n1, camToCenter) / this.s1;
		const ec2 = Vec3.dot(this.n2, camToCenter) / this.s2;

		const A = this.a02 * Math.pow(pe0, 2) +
			this.a12 * Math.pow(pe1, 2) +
			this.a22 * Math.pow(pe2, 2);

		const B = this.a02 * (2 * pe0 * ec0) +
			this.a12 * (2 * pe1 * ec1) +
			this.a22 * (2 * pe2 * ec2) +
			this.a21 * pe2;

		const C = this.a02 * Math.pow(ec0, 2) +
			this.a12 * Math.pow(ec1, 2) +
			this.a22 * Math.pow(ec2, 2) +
			this.a21 * ec2 +
			this.a00;

		let t;

		if (A === 0) {
			t = -C / B;
		} else {
			const delta = Math.pow(B, 2) - 4 * A * C;

			if (delta < 0) {
				return;
			}

			const sqrtDelta = Math.sqrt(delta);

			t = Math.min((-B - sqrtDelta) / (2 * A), (-B + sqrtDelta) / (2 * A));
		}

		if (t <= 0) {
			return;
		}

		const intersectionPoint = ray.at(t);

		const relPos = Vec3.subtract(intersectionPoint, this.pCenter);
		const normal = Vec3.normalize(Vec3.add(
			Vec3.scalarProd(2 * this.a02 * (Vec3.dot(this.n0, relPos) / Math.pow(this.s0, 2)), this.n0),
			Vec3.scalarProd(2 * this.a12 * (Vec3.dot(this.n1, relPos) / Math.pow(this.s1, 2)), this.n1),
			Vec3.scalarProd(2 * this.a22 * (Vec3.dot(this.n2, relPos) / Math.pow(this.s2, 2)), this.n2),
			Vec3.scalarProd(this.a21 / this.s2, this.n2)
		));

		const reflDir = Vec3.normalize(
			Vec3.subtract(ray.dir,
				Vec3.scalarProd(
					2 * Vec3.dot(ray.dir, normal),
					normal
				)
			)
		);

		let u, v, tangent, bitangent;

		if (this.mat.diffuseMap || this.mat.normalMap || this.mat.proceduralTexture) {
			const tex0 = Vec3.dot(this.n0, relPos) / this.s0;
			const tex1 = Vec3.dot(this.n1, relPos) / this.s1;
			const tex2 = Vec3.dot(this.n2, relPos) / this.s2;

			v = Math.acos(tex2) / Math.PI;
			u = Math.acos(tex1 / Math.sin(Math.PI * v)) / (Math.PI * 2);

            if (this.mat.normalMap) {
                tangent = Vec3.normalize(Vec3.cross(ray.dir, normal));
                bitangent = Vec3.normalize(Vec3.cross(tangent, normal));
            }
		}

		return {
			t: t,
			rayDir: ray.dir,
			intersectionPoint: intersectionPoint,
			normal: normal,
            tangent: tangent,
            bitangent: bitangent,
			reflDir: reflDir,
			obj: this,
			texCoord: {
				u: u,
				v: v,
			},
		}
	}
}
