import { saturate } from './saturate'

/**
 * Map `x` linearly from [`a`, `b`] to [0, 1], clamping outside that range.
 */
export function linearstep(a: number, b: number, x: number): number {
	return saturate((x - a) / (b - a))
}
