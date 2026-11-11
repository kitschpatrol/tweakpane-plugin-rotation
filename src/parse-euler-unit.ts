import type { EulerUnit } from './euler-unit'

/**
 * Narrow an unknown value to an `EulerUnit`, or `undefined` if it is not one.
 */
export function parseEulerUnit(value: unknown): EulerUnit | undefined {
	switch (value) {
		case 'deg':
		case 'rad':
		case 'turn': {
			return value
		}

		default: {
			return undefined
		}
	}
}
