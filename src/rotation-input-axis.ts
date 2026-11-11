import type { Constraint, NumberTextProps } from '@tweakpane/core'

export type RotationInputAxis = {
	baseStep: number
	constraint: Constraint<number> | undefined
	textProps: NumberTextProps
}
