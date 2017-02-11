const Vec3 = require('./Vec3');

module.exports = class QuadraticShape {
	constructor(color, pCenter, p0, p1, v1, s0, s1, s2, a02, a12, a22, a21, a00) {
		this.color = color;
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

	intersect(ray) {
		// if (this.a02 == 0 && this.a12 == 0 && this.a22 == 0) {
  //           return 1;
  //       }

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

		if (A == 0) {
			return -C / B;
		}

		const delta = Math.pow(B, 2) - 4 * A * C;

		if (delta < 0) {
			return;
		}

		return (-B - Math.sqrt(delta)) / (2 * A);

		// return {
		// 	t1: (-B - Math.sqrt(delta)) / (2 * A),
		// 	t2: (-B + Math.sqrt(delta)) / (2 * A),
		// }
	}
}