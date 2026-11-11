/* eslint-disable unicorn/name-replacements -- Mod means modulo, not module. */
import { lofi } from './lofi'

/**
 * Floored modulo. The result takes the sign of the divisor `d`.
 */
export function mod(x: number, d: number): number {
	return x - lofi(x, d)
}
