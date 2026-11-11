/**
 * Round `x` down to the nearest multiple of `d`.
 */
export function lofi(x: number, d: number): number {
	return Math.floor(x / d) * d
}
