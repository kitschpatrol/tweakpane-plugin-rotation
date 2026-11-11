import type { Constraint } from '@tweakpane/core'
import { ValueMap } from '@tweakpane/core'
import type { RotationInputAxis } from './rotation-input-axis'

/**
 * Text field settings for one quaternion component.
 */
export function createAxisQuaternion(
	constraint: Constraint<number> | undefined,
): RotationInputAxis {
	return {
		baseStep: 0.01,
		constraint,
		textProps: ValueMap.fromObject({
			formatter(value: number): string {
				return Math.abs(value) < 0.995 ? value.toFixed(2).replace('0.', '.') : value.toFixed(1)
			},
			keyScale: 0.01,
			pointerScale: 0.01,
		}),
	}
}
