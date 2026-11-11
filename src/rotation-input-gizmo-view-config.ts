import type { PickerLayout, Value, ViewProps } from '@tweakpane/core'
import type { Rotation } from './rotation'

export type RotationInputGizmoViewConfig = {
	mode: Value<'angle-r' | 'angle-x' | 'angle-y' | 'angle-z' | 'auto' | 'free'>
	pickerLayout: PickerLayout
	value: Value<Rotation>
	viewProps: ViewProps
}
