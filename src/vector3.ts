import type { Quaternion } from './quaternion'

export class Vector3 {
	public x: number
	public y: number
	public z: number

	public get length(): number {
		return Math.sqrt(this.lengthSq)
	}

	public get lengthSq(): number {
		return this.x * this.x + this.y * this.y + this.z * this.z
	}

	public get negated(): Vector3 {
		return new Vector3(-this.x, -this.y, -this.z)
	}

	public get normalized(): Vector3 {
		const l = this.length

		return l === 0 ? new Vector3() : new Vector3(this.x / l, this.y / l, this.z / l)
	}

	public constructor(x = 0, y = 0, z = 0) {
		this.x = x
		this.y = y
		this.z = z
	}

	public add(v: Vector3): Vector3 {
		return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
	}

	public applyQuaternion(q: Quaternion): Vector3 {
		const ix = q.w * this.x + q.y * this.z - q.z * this.y
		const iy = q.w * this.y + q.z * this.x - q.x * this.z
		const iz = q.w * this.z + q.x * this.y - q.y * this.x
		const iw = -q.x * this.x - q.y * this.y - q.z * this.z

		return new Vector3(
			ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
			iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
			iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
		)
	}

	public cross(v: Vector3): Vector3 {
		return new Vector3(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x,
		)
	}

	public dot(v: Vector3): number {
		return this.x * v.x + this.y * v.y + this.z * v.z
	}

	public getComponents(): number[] {
		return [this.x, this.y, this.z]
	}

	public orthoNormalize(tangent: Vector3): {
		binormal: Vector3
		normal: Vector3
		tangent: Vector3
	} {
		const normal = this.normalized
		tangent = tangent.normalized

		let dotNT = normal.dot(tangent)

		if (dotNT === 1) {
			tangent =
				Math.abs(normal.y) > Math.abs(normal.z) ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0)
			dotNT = normal.dot(tangent)
		}

		tangent = tangent.sub(normal.scale(dotNT)).normalized

		const binormal = tangent.cross(normal)

		return {
			binormal,
			normal,
			tangent,
		}
	}

	public scale(s: number): Vector3 {
		return new Vector3(this.x * s, this.y * s, this.z * s)
	}

	public sub(v: Vector3): Vector3 {
		return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
	}
}
