import { clamp } from './clamp'

/**
 * Clamp `x` to the range [0, 1].
 */
export function saturate(x: number): number {
	return clamp(x, 0, 1)
}
