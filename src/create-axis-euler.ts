import type { Constraint } from '@tweakpane/core'
import { createNumberFormatter, ValueMap } from '@tweakpane/core'
import type { RotationInputAxis } from './rotation-input-axis'

/**
 * Text field settings for one Euler angle component shown with `digits` decimal
 * places.
 */
export function createAxisEuler(
	digits: number,
	constraint: Constraint<number> | undefined,
): RotationInputAxis {
	const step = 0.1 ** digits

	return {
		baseStep: step,
		constraint,
		textProps: ValueMap.fromObject({
			formatter: createNumberFormatter(digits),
			keyScale: step,
			pointerScale: step,
		}),
	}
}
