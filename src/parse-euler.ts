import type { EulerOrder } from './euler-order'
import type { EulerUnit } from './euler-unit'
import { Euler } from './euler'

/**
 * Read an Euler rotation from an object with numeric `x`, `y`, and `z`
 * properties, falling back to zero rotation.
 */
export function parseEuler(exValue: unknown, order: EulerOrder, unit: EulerUnit): Euler {
	if (
		typeof exValue === 'object' &&
		exValue !== null &&
		'x' in exValue &&
		'y' in exValue &&
		'z' in exValue
	) {
		const { x, y, z } = exValue
		if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
			return new Euler(x, y, z, order, unit)
		}
	}

	return new Euler(0, 0, 0, order, unit)
}
