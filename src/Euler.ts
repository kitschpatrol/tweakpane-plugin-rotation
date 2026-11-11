import type { EulerOrder } from './euler-order'
import type { EulerUnit } from './euler-unit'
import { EULER_ORDER_AXES } from './euler-order'
import { Quaternion } from './quaternion'
import { Rotation } from './rotation'
import { clamp } from './utils/clamp'
import { sanitizeAngle } from './utils/sanitize-angle'

export class Euler extends Rotation {
	public order: EulerOrder

	public unit: EulerUnit
	public x: number
	public y: number
	public z: number
	public get quat(): Quaternion {
		return Quaternion.fromEuler(this)
	}

	public constructor(x = 0, y = 0, z = 0, order: EulerOrder = 'XYZ', unit: EulerUnit = 'rad') {
		super()

		this.x = x
		this.y = y
		this.z = z
		this.order = order
		this.unit = unit
	}

	public static fromQuaternion(quat: Quaternion, order: EulerOrder, unit: EulerUnit): Euler {
		const m = quat.toMat3()
		const [i, j, k, sign] = EULER_ORDER_AXES[order]

		const result: [number, number, number] = [0, 0, 0]

		const c = m[i][k]
		result[j] = -sign * Math.asin(clamp(c, -1, 1))

		if (Math.abs(c) < 0.999999) {
			result[i] = sign * Math.atan2(m[j][k], m[k][k])
			result[k] = sign * Math.atan2(m[i][j], m[i][i])
		} else {
			// "y is 90deg" cases
			result[i] = sign * Math.atan2(-m[k][j], m[j][j])
		}

		if (Math.abs(result[i]) + Math.abs(result[k]) > Math.PI) {
			// "two big revolutions" cases
			result[i] = sanitizeAngle(result[i] + Math.PI)
			result[j] = sanitizeAngle(Math.PI - result[j])
			result[k] = sanitizeAngle(result[k] + Math.PI)
		}

		return new Euler(...result, order).reunit(unit)
	}

	public format(r: Rotation): Euler {
		return r instanceof Euler ? r.reorder(this.order) : r.toEuler(this.order, this.unit)
	}

	public getComponents(): [number, number, number] {
		return [this.x, this.y, this.z]
	}

	public reorder(order: EulerOrder): Euler {
		return order === this.order ? this : this.quat.toEuler(order, this.unit)
	}

	public reunit(unit: EulerUnit): Euler {
		const previous2Rad = {
			deg: Math.PI / 180,
			rad: 1,
			turn: 2 * Math.PI,
		}[this.unit]

		const rad2Next = {
			deg: 180 / Math.PI,
			rad: 1,
			turn: 0.5 / Math.PI,
		}[unit]

		const previous2Next = previous2Rad * rad2Next

		return new Euler(
			previous2Next * this.x,
			previous2Next * this.y,
			previous2Next * this.z,
			this.order,
			unit,
		)
	}

	public toEuler(order: EulerOrder, unit: EulerUnit): Euler {
		return this.reorder(order).reunit(unit)
	}
}
