import type { EulerOrder } from './euler-order'
import type { EulerUnit } from './euler-unit'
import type { Vector3 } from './vector3'
import { Euler } from './euler'
import { EULER_ORDER_AXES } from './euler-order'
import { Rotation } from './rotation'

export class Quaternion extends Rotation {
	public w: number

	public x: number

	public y: number

	public z: number
	public get ban360s(): Quaternion {
		return this.w < 0 ? this.negated : this
	}
	public get length(): number {
		return Math.sqrt(this.lengthSq)
	}
	public get lengthSq(): number {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
	}

	public get negated(): Quaternion {
		return new Quaternion(-this.x, -this.y, -this.z, -this.w)
	}

	public get normalized(): Quaternion {
		const l = this.length

		return l === 0
			? new Quaternion()
			: new Quaternion(this.x / l, this.y / l, this.z / l, this.w / l)
	}

	public get quat(): this {
		return this
	}

	public constructor(x = 0, y = 0, z = 0, w = 1) {
		super()

		this.x = x
		this.y = y
		this.z = z
		this.w = w
	}

	public static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
		const halfAngle = angle / 2
		const sinHalfAngle = Math.sin(halfAngle)

		return new Quaternion(
			axis.x * sinHalfAngle,
			axis.y * sinHalfAngle,
			axis.z * sinHalfAngle,
			Math.cos(halfAngle),
		)
	}

	public static fromEuler(input: Euler): Quaternion {
		const euler = input.reunit('rad')
		const [i, j, k, sign] = EULER_ORDER_AXES[euler.order]

		const components = euler.getComponents()

		const ti = 0.5 * components[i]
		const tj = 0.5 * sign * components[j]
		const tk = 0.5 * components[k]

		const ci = Math.cos(ti)
		const cj = Math.cos(tj)
		const ck = Math.cos(tk)
		const si = Math.sin(ti)
		const sj = Math.sin(tj)
		const sk = Math.sin(tk)

		const result: [number, number, number, number] = [0, 0, 0, ck * cj * ci + sk * sj * si]
		result[i] = ck * cj * si - sk * sj * ci
		result[j] = sign * (ck * sj * ci + sk * cj * si)
		result[k] = sk * cj * ci - ck * sj * si

		return new Quaternion(...result)
	}

	public static lookRotation(look: Vector3, up: Vector3): Quaternion {
		const { binormal, normal, tangent } = look.orthoNormalize(up)

		const m11 = binormal.x
		const m12 = tangent.x
		const m13 = normal.x
		const m21 = binormal.y
		const m22 = tangent.y
		const m23 = normal.y
		const m31 = binormal.z
		const m32 = tangent.z
		const m33 = normal.z

		// Ref: https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
		// Ref: https://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		const trace = m11 + m22 + m33

		if (trace > 0) {
			const s = 0.5 / Math.sqrt(trace + 1)

			return new Quaternion((m32 - m23) * s, (m13 - m31) * s, (m21 - m12) * s, 0.25 / s)
		}

		if (m11 > m22 && m11 > m33) {
			const s = 2 * Math.sqrt(1 + m11 - m22 - m33)

			return new Quaternion(0.25 * s, (m12 + m21) / s, (m13 + m31) / s, (m32 - m23) / s)
		}

		if (m22 > m33) {
			const s = 2 * Math.sqrt(1 + m22 - m11 - m33)

			return new Quaternion((m12 + m21) / s, 0.25 * s, (m23 + m32) / s, (m13 - m31) / s)
		}

		const s = 2 * Math.sqrt(1 + m33 - m11 - m22)

		return new Quaternion((m13 + m31) / s, (m23 + m32) / s, 0.25 * s, (m21 - m12) / s)
	}

	public format(r: Rotation): Quaternion {
		return r.quat
	}

	public getComponents(): number[] {
		return [this.x, this.y, this.z, this.w]
	}

	public override multiply(br: Rotation): Quaternion {
		const b = br.quat

		return new Quaternion(
			this.w * b.x + this.x * b.w + this.y * b.z - this.z * b.y,
			this.w * b.y - this.x * b.z + this.y * b.w + this.z * b.x,
			this.w * b.z + this.x * b.y - this.y * b.x + this.z * b.w,
			this.w * b.w - this.x * b.x - this.y * b.y - this.z * b.z,
		)
	}

	public override slerp(br: Rotation, t: number): Quaternion {
		if (t === 0) {
			return this
		}

		let b = br.quat

		if (t === 1) {
			return b
		}

		// Ref: https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
		// Ref: https://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

		const a = this.ban360s
		b = b.ban360s

		let cosHalfTheta = a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z

		if (cosHalfTheta < 0) {
			b = b.negated
			cosHalfTheta = -cosHalfTheta
		}

		// I think you two are same
		if (cosHalfTheta >= 1) {
			return a
		}

		const sqrSinHalfTheta = 1 - cosHalfTheta * cosHalfTheta

		// Fallback to simple lerp
		if (sqrSinHalfTheta <= Number.EPSILON) {
			const s = 1 - t

			return new Quaternion(
				s * a.x + t * b.x,
				s * a.y + t * b.y,
				s * a.z + t * b.z,
				s * a.w + t * b.w,
			).normalized
		}

		// Welcome
		const sinHalfTheta = Math.sqrt(sqrSinHalfTheta)
		const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta)
		const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta
		const ratioB = Math.sin(t * halfTheta) / sinHalfTheta

		return new Quaternion(
			a.x * ratioA + b.x * ratioB,
			a.y * ratioA + b.y * ratioB,
			a.z * ratioA + b.z * ratioB,
			a.w * ratioA + b.w * ratioB,
		)
	}

	public toEuler(order: EulerOrder, unit: EulerUnit): Euler {
		return Euler.fromQuaternion(this, order, unit)
	}

	/**
	 * The rotation matrix as an array of its three columns, indexed
	 * `m[column][row]`.
	 */
	public toMat3(): [[number, number, number], [number, number, number], [number, number, number]] {
		const { x, y, z, w } = this

		return [
			[1 - 2 * y * y - 2 * z * z, 2 * x * y + 2 * z * w, 2 * x * z - 2 * y * w],
			[2 * x * y - 2 * z * w, 1 - 2 * x * x - 2 * z * z, 2 * y * z + 2 * x * w],
			[2 * x * z + 2 * y * w, 2 * y * z - 2 * x * w, 1 - 2 * x * x - 2 * y * y],
		]
	}
}
