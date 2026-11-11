import { describe, expect, it } from 'vitest'
import { clamp } from '../src/utils/clamp'
import { iikanjiEaseout } from '../src/utils/iikanji-easeout'
import { linearstep } from '../src/utils/linearstep'
// eslint-disable-next-line unicorn/name-replacements -- Mod means modulo, not module.
import { mod } from '../src/utils/mod'
import { sanitizeAngle } from '../src/utils/sanitize-angle'

describe('mod', () => {
	it('returns a remainder with the sign of the divisor', () => {
		expect(mod(7, 3)).toBe(1)
		expect(mod(-1, 3)).toBe(2)
		expect(mod(6, 3)).toBe(0)
		expect(mod(1, -3)).toBe(-2)
	})
})

describe('sanitizeAngle', () => {
	it.each([
		[0, 0],
		[Math.PI / 2, Math.PI / 2],
		[(3 * Math.PI) / 2, -Math.PI / 2],
		[(-3 * Math.PI) / 2, Math.PI / 2],
		[5 * Math.PI, -Math.PI],
		[Math.PI, -Math.PI],
		[-Math.PI, -Math.PI],
	])('wraps %d into [-π, π)', (angle, expected) => {
		expect(sanitizeAngle(angle)).toBeCloseTo(expected)
	})
})

describe('clamp and linearstep', () => {
	it('limits values to a range', () => {
		expect(clamp(-1, 0, 2)).toBe(0)
		expect(clamp(1, 0, 2)).toBe(1)
		expect(clamp(3, 0, 2)).toBe(2)
	})

	it('maps a range to [0, 1] and clamps outside it', () => {
		expect(linearstep(0, 300, -10)).toBe(0)
		expect(linearstep(0, 300, 150)).toBe(0.5)
		expect(linearstep(0, 300, 600)).toBe(1)
	})
})

describe('iikanjiEaseout', () => {
	it('starts at 0, ends at 1, and rises monotonically between them', () => {
		expect(iikanjiEaseout(-1)).toBe(0)
		expect(iikanjiEaseout(0)).toBe(0)
		expect(iikanjiEaseout(1)).toBe(1)
		expect(iikanjiEaseout(2)).toBe(1)
		let previous = 0
		for (let i = 1; i <= 100; i++) {
			const value = iikanjiEaseout(i / 100)
			expect(value).toBeGreaterThanOrEqual(previous)
			expect(value).toBeLessThanOrEqual(1)
			previous = value
		}
	})
})
