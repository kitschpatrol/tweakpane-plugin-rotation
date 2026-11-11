// eslint-disable-next-line unicorn/name-replacements -- Mod means modulo, not module.
import { mod } from './mod'

/**
 * Wrap an angle in radians into the range [-π, π).
 */
export function sanitizeAngle(angle: number): number {
	return mod(angle + Math.PI, Math.PI * 2) - Math.PI
}
