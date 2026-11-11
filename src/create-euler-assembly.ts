import type { PointNdAssembly } from '@tweakpane/core'
import type { EulerOrder } from './euler-order'
import type { EulerUnit } from './euler-unit'
import { Euler } from './euler'

/**
 * Convert between Euler rotations and the component arrays the text inputs
 * edit.
 */
export function createEulerAssembly(order: EulerOrder, unit: EulerUnit): PointNdAssembly<Euler> {
	return {
		fromComponents: (c: number[]) => new Euler(c[0], c[1], c[2], order, unit),
		toComponents: (r: Euler) => r.getComponents(),
	}
}
