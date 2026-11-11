import { Quaternion } from './quaternion'

/**
 * Read a quaternion from an object with numeric `x`, `y`, `z`, and `w`
 * properties, falling back to the identity rotation.
 */
export function parseQuaternion(exValue: unknown): Quaternion {
	if (
		typeof exValue === 'object' &&
		exValue !== null &&
		'x' in exValue &&
		'y' in exValue &&
		'z' in exValue &&
		'w' in exValue
	) {
		const { x, y, z, w } = exValue
		if (
			typeof x === 'number' &&
			typeof y === 'number' &&
			typeof z === 'number' &&
			typeof w === 'number'
		) {
			return new Quaternion(x, y, z, w)
		}
	}

	return new Quaternion(0, 0, 0, 1)
}
