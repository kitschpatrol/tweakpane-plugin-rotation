import type { PickerLayout, Value, ViewProps } from '@tweakpane/core'
import type { Rotation } from './rotation'

export type RotationInputGizmoControllerConfig = {
	pickerLayout: PickerLayout
	value: Value<Rotation>
	viewProps: ViewProps
}
