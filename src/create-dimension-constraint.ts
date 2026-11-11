import type { Constraint, PointDimensionParams } from '@tweakpane/core'
import { CompositeConstraint, isEmpty, RangeConstraint, StepConstraint } from '@tweakpane/core'

/**
 * Combine a component's `step`, `min`, and `max` parameters into one
 * constraint.
 */
export function createDimensionConstraint(
	params: PointDimensionParams | undefined,
): Constraint<number> | undefined {
	if (!params) {
		return undefined
	}

	const constraints: Array<Constraint<number>> = []

	if (!isEmpty(params.step)) {
		constraints.push(new StepConstraint(params.step))
	}

	if (!isEmpty(params.max) || !isEmpty(params.min)) {
		constraints.push(
			new RangeConstraint({
				min: params.min,
				max: params.max,
			}),
		)
	}

	return new CompositeConstraint(constraints)
}
