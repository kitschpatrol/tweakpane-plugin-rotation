import type { EulerOrder } from './euler-order'

/**
 * Narrow an unknown value to an `EulerOrder`, or `undefined` if it is not one.
 */
export function parseEulerOrder(value: unknown): EulerOrder | undefined {
	switch (value) {
		case 'XYZ':
		case 'XZY':
		case 'YXZ':
		case 'YZX':
		case 'ZXY':
		case 'ZYX': {
			return value
		}

		default: {
			return undefined
		}
	}
}
