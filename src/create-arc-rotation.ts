import type { Vector3 } from './vector3'
import { Quaternion } from './quaternion'

/**
 * Rotation that orients a half-circle arc around `axis` so it faces toward
 * `front`.
 */
export function createArcRotation(axis: Vector3, front: Vector3): Quaternion {
	const b = front.z > 0 ? new Quaternion(0, 0, 0, 1) : new Quaternion(0, 0, 1, 0)

	return Math.abs(axis.z) > 0.9999 ? b : Quaternion.lookRotation(axis, front)
}
