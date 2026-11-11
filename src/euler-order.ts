/**
 * Note that this is **extrinsic** rotations (which is same as Blender, Maya,
 * and Unity). Three.js uses intrinsic rotations so you have to reverse the
 * order if you want to match the behavior with Three.js.
 */
export type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX'

type AxisIndex = 0 | 1 | 2

/**
 * Component indices of the first, second, and third rotation axes for each
 * order, followed by the sign of the order's permutation parity.
 */
export const EULER_ORDER_AXES: Record<
	EulerOrder,
	readonly [AxisIndex, AxisIndex, AxisIndex, -1 | 1]
> = {
	YZX: [1, 2, 0, 1],
	ZYX: [2, 1, 0, -1],
	XZY: [0, 2, 1, -1],
	ZXY: [2, 0, 1, 1],
	XYZ: [0, 1, 2, 1],
	YXZ: [1, 0, 2, -1],
}
