import type { Euler } from './euler'
import type { EulerOrder } from './euler-order'
import type { EulerUnit } from './euler-unit'
import type { Quaternion } from './quaternion'

export abstract class Rotation {
	public abstract get quat(): Quaternion

	/**
	 * Convert the input rotation to the format compatible with this rotation.
	 */
	public abstract format(r: Rotation): Rotation

	public multiply(b: Rotation): Rotation {
		return this.format(this.quat.multiply(b.quat))
	}

	public premultiply(a: Rotation): Rotation {
		return this.format(a.multiply(this))
	}

	public slerp(b: Rotation, t: number): Rotation {
		return this.format(this.quat.slerp(b.quat, t))
	}

	public abstract toEuler(order: EulerOrder, unit: EulerUnit): Euler
}
