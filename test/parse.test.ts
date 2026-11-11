import { describe, expect, it } from 'vitest'
import { Euler } from '../src/euler'
import { parseEuler } from '../src/parse-euler'
import { parseEulerOrder } from '../src/parse-euler-order'
import { parseEulerUnit } from '../src/parse-euler-unit'
import { parseQuaternion } from '../src/parse-quaternion'
import { Quaternion } from '../src/quaternion'

const INVALID_VALUES: Array<[string, unknown]> = [
	['undefined', undefined],
	['null', null],
	['a number', 1],
	['a string', 'xyz'],
	['an array', [1, 2, 3, 4]],
	['an empty object', {}],
	['a missing component', { x: 1, y: 2 }],
	['a string component', { x: '1', y: 2, z: 3, w: 1 }],
	['a null component', { x: null, y: 2, z: 3, w: 1 }],
]

describe('parseEuler', () => {
	it('reads numeric x, y, and z with the requested order and unit', () => {
		const euler = parseEuler({ x: 10, y: -20, z: 30.5 }, 'ZXY', 'deg')
		expect(euler).toBeInstanceOf(Euler)
		expect(euler.getComponents()).toEqual([10, -20, 30.5])
		expect(euler.order).toBe('ZXY')
		expect(euler.unit).toBe('deg')
	})

	it('reads components from getters and ignores extra properties', () => {
		const source = new Euler(1, 2, 3, 'XYZ', 'turn')
		const euler = parseEuler(source, 'YZX', 'rad')
		expect(euler.getComponents()).toEqual([1, 2, 3])
		expect(euler.order).toBe('YZX')
		expect(euler.unit).toBe('rad')
		expect(parseEuler({ x: 1, y: 2, z: 3, w: 4 }, 'XYZ', 'rad').getComponents()).toEqual([1, 2, 3])
	})

	it.each(INVALID_VALUES)('falls back to zero rotation for %s', (_, value) => {
		const euler = parseEuler(value, 'XZY', 'turn')
		expect(euler.getComponents()).toEqual([0, 0, 0])
		expect(euler.order).toBe('XZY')
		expect(euler.unit).toBe('turn')
	})
})

describe('parseQuaternion', () => {
	it('reads numeric x, y, z, and w without normalizing', () => {
		const quaternion = parseQuaternion({ x: 1, y: 2, z: 3, w: 4 })
		expect(quaternion).toBeInstanceOf(Quaternion)
		expect(quaternion.getComponents()).toEqual([1, 2, 3, 4])
	})

	it('reads components from getters', () => {
		expect(parseQuaternion(new Quaternion(0.5, 0.5, 0.5, 0.5)).getComponents()).toEqual([
			0.5, 0.5, 0.5, 0.5,
		])
	})

	it.each([...INVALID_VALUES, ['a missing w', { x: 0, y: 0, z: 0 }]])(
		'falls back to the identity for %s',
		(_, value) => {
			expect(parseQuaternion(value).getComponents()).toEqual([0, 0, 0, 1])
		},
	)
})

describe('parseEulerOrder', () => {
	it.each(['XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX'])('accepts %s', (order) => {
		expect(parseEulerOrder(order)).toBe(order)
	})

	it.each([undefined, null, '', 'xyz', 'XYX', 'XY', 123])('rejects %s', (value) => {
		expect(parseEulerOrder(value)).toBeUndefined()
	})
})

describe('parseEulerUnit', () => {
	it.each(['deg', 'rad', 'turn'])('accepts %s', (unit) => {
		expect(parseEulerUnit(unit)).toBe(unit)
	})

	it.each([undefined, null, '', 'DEG', 'degrees', 'grad', 1])('rejects %s', (value) => {
		expect(parseEulerUnit(value)).toBeUndefined()
	})
})
