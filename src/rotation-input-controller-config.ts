import type { Parser, PickerLayout, PointNdAssembly, Value, ViewProps } from '@tweakpane/core'
import type { Euler } from './euler'
import type { Quaternion } from './quaternion'
import type { Rotation } from './rotation'
import type { RotationInputAxis } from './rotation-input-axis'
import type { RotationInputRotationMode } from './rotation-input-rotation-mode'

export type RotationInputControllerConfig = {
	assembly: PointNdAssembly<Euler> | PointNdAssembly<Quaternion>
	axes: RotationInputAxis[]
	expanded: boolean
	parser: Parser<number>
	pickerLayout: PickerLayout
	rotationMode: RotationInputRotationMode
	value: Value<Rotation>
	viewProps: ViewProps
}
