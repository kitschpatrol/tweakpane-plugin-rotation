import { describe, expect, it } from 'vitest'
import type { EulerOrder } from '../src/euler-order'
import { Euler } from '../src/euler'
import { Quaternion } from '../src/quaternion'
import { Vector3 } from '../src/vector3'

type Axis = 'X' | 'Y' | 'Z'

const AXES: Record<Axis, Vector3> = {
	X: new Vector3(1, 0, 0),
	Y: new Vector3(0, 1, 0),
	Z: new Vector3(0, 0, 1),
}

const AXIS_SEQUENCES: Record<EulerOrder, [Axis, Axis, Axis]> = {
	YZX: ['Y', 'Z', 'X'],
	ZYX: ['Z', 'Y', 'X'],
	XZY: ['X', 'Z', 'Y'],
	ZXY: ['Z', 'X', 'Y'],
	XYZ: ['X', 'Y', 'Z'],
	YXZ: ['Y', 'X', 'Z'],
}

const ORDERS = Object.keys(AXIS_SEQUENCES) as EulerOrder[]

function closeTo(values: readonly number[]): unknown[] {
	return values.map((value): unknown => expect.closeTo(value, 9))
}

/**
 * Angle in radians between two rotations. Quaternions q and -q describe the
 * same rotation, so the sign of their dot product is ignored.
 */
function rotationDifference(a: Quaternion, b: Quaternion): number {
	const { normalized: na } = a
	const { normalized: nb } = b
	const dot = na.x * nb.x + na.y * nb.y + na.z * nb.z + na.w * nb.w
	return 2 * Math.acos(Math.min(1, Math.abs(dot)))
}

function axisAngle(axis: Axis, angle: number): Quaternion {
	return Quaternion.fromAxisAngle(AXES[axis], angle)
}

describe('Euler and quaternion conversion', () => {
	it.each(ORDERS)('round-trips %s angles through a quaternion', (order) => {
		const samples: Array<[number, number, number]> = [
			[0, 0, 0],
			[0.2, 0.3, 0.4],
			[-1.2, 0.7, 1.5],
			[1, -1.4, -0.5],
		]
		for (const angles of samples) {
			const result = Quaternion.fromEuler(new Euler(...angles, order)).toEuler(order, 'rad')
			expect(result.order).toBe(order)
			expect(result.getComponents()).toEqual(closeTo(angles))
		}
	})

	it.each(ORDERS)('preserves %s rotations at gimbal lock and past half turns', (order) => {
		const samples: Array<[number, number, number]> = [
			[0.3, Math.PI / 2, 0.2],
			[0.3, -Math.PI / 2, -0.2],
			[2.5, 0.3, 2.8],
			[-3, -1, 3],
		]
		for (const angles of samples) {
			const source = new Euler(...angles, order).quat
			expect(rotationDifference(source.toEuler(order, 'rad').quat, source)).toBeCloseTo(0, 6)
		}
	})

	it.each(ORDERS)('applies %s rotations extrinsically, first letter first', (order) => {
		const source = new Euler(0.4, -0.9, 1.3, order)
		const angles: Record<Axis, number> = { X: source.x, Y: source.y, Z: source.z }
		const [first, second, third] = AXIS_SEQUENCES[order]
		const expected = axisAngle(third, angles[third])
			.multiply(axisAngle(second, angles[second]))
			.multiply(axisAngle(first, angles[first]))
		expect(rotationDifference(source.quat, expected)).toBeCloseTo(0, 6)
	})

	it('converts a single-axis rotation to the matching quaternion', () => {
		expect(new Euler(Math.PI / 2, 0, 0).quat.getComponents()).toEqual(
			closeTo([Math.SQRT1_2, 0, 0, Math.SQRT1_2]),
		)
		expect(new Euler(0, 0, 0).quat.getComponents()).toEqual(closeTo([0, 0, 0, 1]))
	})

	it('defaults to the XYZ order in radians', () => {
		const euler = new Euler()
		expect(euler.getComponents()).toEqual([0, 0, 0])
		expect(euler.order).toBe('XYZ')
		expect(euler.unit).toBe('rad')
		expect(new Quaternion().getComponents()).toEqual([0, 0, 0, 1])
	})

	it('reorders an Euler rotation without changing the rotation it describes', () => {
		const source = new Euler(30, 45, 60, 'XYZ', 'deg')
		const reordered = source.reorder('ZYX')
		expect(reordered.order).toBe('ZYX')
		expect(reordered.unit).toBe('deg')
		expect(rotationDifference(reordered.quat, source.quat)).toBeCloseTo(0, 6)
		expect(source.reorder('XYZ').getComponents()).toEqual([30, 45, 60])
	})

	it('formats other rotations to match the receiver', () => {
		const euler = new Euler(0, 0, 0, 'YZX', 'turn')
		const formatted = euler.format(axisAngle('Y', Math.PI))
		expect(formatted).toBeInstanceOf(Euler)
		expect(formatted.order).toBe('YZX')
		expect(formatted.unit).toBe('turn')
		expect(formatted.getComponents()).toEqual(closeTo([0, 0.5, 0]))

		const quaternion = new Quaternion().format(new Euler(0, Math.PI / 2, 0))
		expect(quaternion).toBeInstanceOf(Quaternion)
		expect(quaternion.getComponents()).toEqual(closeTo([0, Math.SQRT1_2, 0, Math.SQRT1_2]))
	})
})

describe('Euler units', () => {
	it('converts between degrees, radians, and turns', () => {
		const degrees = new Euler(180, 90, -45, 'ZXY', 'deg')
		const radians = degrees.reunit('rad')
		expect(radians.order).toBe('ZXY')
		expect(radians.unit).toBe('rad')
		expect(radians.getComponents()).toEqual(closeTo([Math.PI, Math.PI / 2, -Math.PI / 4]))
		expect(radians.reunit('turn').getComponents()).toEqual(closeTo([0.5, 0.25, -0.125]))
		expect(new Euler(0.5, 0.25, -1, 'XYZ', 'turn').reunit('deg').getComponents()).toEqual(
			closeTo([180, 90, -360]),
		)
		expect(degrees.reunit('deg').getComponents()).toEqual([180, 90, -45])
	})

	it.each(['deg', 'rad', 'turn'] as const)('describes the same rotation in %s', (unit) => {
		const radians = new Euler(0.3, -0.6, 1.1, 'YXZ', 'rad')
		const converted = radians.reunit(unit)
		expect(rotationDifference(converted.quat, radians.quat)).toBeCloseTo(0, 6)
		const decoded = radians.quat.toEuler('YXZ', unit)
		expect(decoded.unit).toBe(unit)
		expect(decoded.getComponents()).toEqual(closeTo(converted.getComponents()))
	})
})

describe('Quaternion', () => {
	it('normalizes to unit length and maps zero to the identity', () => {
		const quaternion = new Quaternion(1, 2, 3, 4)
		expect(quaternion.lengthSq).toBe(30)
		expect(quaternion.length).toBeCloseTo(Math.sqrt(30))
		const { normalized } = quaternion
		expect(normalized.length).toBeCloseTo(1)
		expect(normalized.getComponents()).toEqual(
			closeTo([1, 2, 3, 4].map((value) => value / Math.sqrt(30))),
		)
		expect(new Quaternion(0, 0, 0, 0).normalized.getComponents()).toEqual([0, 0, 0, 1])
	})

	it('negates only quaternions with a negative w for the shortest representation', () => {
		expect(new Quaternion(0.5, 0, 0, -0.5).ban360s.getComponents()).toEqual(
			closeTo([-0.5, 0, 0, 0.5]),
		)
		expect(new Quaternion(0.5, 0, 0, 0.5).ban360s.getComponents()).toEqual([0.5, 0, 0, 0.5])
	})

	it('composes rotations by multiplication', () => {
		const quarter = axisAngle('Z', Math.PI / 2)
		expect(quarter.multiply(new Quaternion()).getComponents()).toEqual(
			closeTo(quarter.getComponents()),
		)
		expect(rotationDifference(quarter.multiply(quarter), axisAngle('Z', Math.PI))).toBeCloseTo(0, 6)

		const euler = new Euler(0, 0, 45, 'XYZ', 'deg').multiply(new Euler(0, 0, 45, 'XYZ', 'deg'))
		expect(euler).toBeInstanceOf(Euler)
		expect(euler.toEuler('XYZ', 'deg').getComponents()).toEqual(closeTo([0, 0, 90]))
	})

	it('premultiply applies the argument after the receiver', () => {
		const result = axisAngle('X', Math.PI / 2).premultiply(axisAngle('Z', Math.PI / 2))
		const rotatedY = new Vector3(0, 1, 0).applyQuaternion(result.quat)
		expect(rotatedY.getComponents()).toEqual(closeTo([0, 0, 1]))
		const rotatedZ = new Vector3(0, 0, 1).applyQuaternion(result.quat)
		expect(rotatedZ.getComponents()).toEqual(closeTo([1, 0, 0]))
	})

	it('rotates vectors about an axis', () => {
		const rotated = new Vector3(1, 0, 0).applyQuaternion(axisAngle('Z', Math.PI / 2))
		expect(rotated.getComponents()).toEqual(closeTo([0, 1, 0]))
	})

	it.each([
		{ look: new Vector3(0, 0, 1), up: new Vector3(0, 1, 0) },
		{ look: new Vector3(0, 0, -1), up: new Vector3(0, -1, 0) },
		{ look: new Vector3(0, 0, -1), up: new Vector3(1, 0, 0) },
		{ look: new Vector3(0, 0, 1), up: new Vector3(0, -1, 0) },
		{ look: new Vector3(1, 2, -3), up: new Vector3(0, 1, 1) },
	])('builds a look rotation toward $look.x,$look.y,$look.z', ({ look, up }) => {
		const rotation = Quaternion.lookRotation(look, up)
		expect(rotation.length).toBeCloseTo(1)
		const forward = new Vector3(0, 0, 1).applyQuaternion(rotation)
		expect(forward.getComponents()).toEqual(closeTo(look.normalized.getComponents()))
		const rotatedUp = new Vector3(0, 1, 0).applyQuaternion(rotation)
		expect(rotatedUp.dot(forward)).toBeCloseTo(0)
		expect(rotatedUp.dot(up)).toBeGreaterThan(0)
	})

	it('builds a look rotation when the up vector is parallel to the look direction', () => {
		const rotation = Quaternion.lookRotation(new Vector3(0, 2, 0), new Vector3(0, 1, 0))
		const forward = new Vector3(0, 0, 1).applyQuaternion(rotation)
		expect(forward.getComponents()).toEqual(closeTo([0, 1, 0]))
	})
})

describe('slerp', () => {
	const from = new Quaternion()
	const to = axisAngle('Z', Math.PI / 2)

	it('returns the endpoints at t = 0 and t = 1', () => {
		expect(from.slerp(to, 0)).toBe(from)
		expect(from.slerp(to, 1).getComponents()).toEqual(to.getComponents())
	})

	it('interpolates along the arc between rotations', () => {
		expect(rotationDifference(from.slerp(to, 0.5), axisAngle('Z', Math.PI / 4))).toBeCloseTo(0, 6)
		expect(rotationDifference(from.slerp(to, 0.25), axisAngle('Z', Math.PI / 8))).toBeCloseTo(0, 6)
		expect(from.slerp(to, 0.5).length).toBeCloseTo(1)
	})

	it('takes the shortest path', () => {
		const threeQuarters = axisAngle('Z', (3 * Math.PI) / 2)
		const halfwayToThreeQuarters = from.slerp(threeQuarters, 0.5)
		expect(rotationDifference(halfwayToThreeQuarters, axisAngle('Z', -Math.PI / 4))).toBeCloseTo(
			0,
			6,
		)
		const halfwayAcrossHalfTurn = axisAngle('X', 2.2).slerp(axisAngle('X', -2.2), 0.5)
		expect(rotationDifference(halfwayAcrossHalfTurn, axisAngle('X', Math.PI))).toBeCloseTo(0, 6)
	})

	it('returns the start when both ends describe the same rotation', () => {
		expect(rotationDifference(to.slerp(to.negated, 0.5), to)).toBeCloseTo(0, 6)
	})

	it('keeps the order and unit of an Euler receiver', () => {
		const result = new Euler(0, 0, 0, 'ZYX', 'deg').slerp(new Euler(0, 90, 0, 'ZYX', 'deg'), 0.5)
		expect(result).toBeInstanceOf(Euler)
		expect(result.toEuler('ZYX', 'deg').getComponents()).toEqual(closeTo([0, 45, 0]))
	})
})
