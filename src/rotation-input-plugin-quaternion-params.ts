import type { BaseInputParams, PickerLayout, PointDimensionParams } from '@tweakpane/core'

export type RotationInputPluginQuaternionParams = BaseInputParams & {
	expanded?: boolean
	picker?: PickerLayout
	rotationMode?: 'quaternion'
	view: 'rotation'
	w?: PointDimensionParams
	x?: PointDimensionParams
	y?: PointDimensionParams
	z?: PointDimensionParams
}
