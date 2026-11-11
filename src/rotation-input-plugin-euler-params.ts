import type { BaseInputParams, PickerLayout, PointDimensionParams } from '@tweakpane/core'
import type { EulerOrder } from './euler-order'
import type { EulerUnit } from './euler-unit'

export type RotationInputPluginEulerParams = BaseInputParams & {
	expanded?: boolean
	order?: EulerOrder
	picker?: PickerLayout
	rotationMode: 'euler'
	unit?: EulerUnit
	view: 'rotation'
	x?: PointDimensionParams
	y?: PointDimensionParams
	z?: PointDimensionParams
}
