import type { BindingTarget, InputBindingPlugin, ValueController } from '@tweakpane/core'
import {
	createPlugin,
	parseNumber,
	parsePickerLayout,
	parsePointDimensionParams,
	parseRecord,
	PointNdConstraint,
	TpError,
} from '@tweakpane/core'
import type { Quaternion } from './quaternion'
import type { RotationInputPluginQuaternionParams } from './rotation-input-plugin-quaternion-params'
import { createAxisQuaternion } from './create-axis-quaternion'
import { createDimensionConstraint } from './create-dimension-constraint'
import { parseQuaternion } from './parse-quaternion'
import { QuaternionAssembly } from './quaternion-assembly'
import { RotationInputController } from './rotation-input-controller'

function writeQuaternion(target: BindingTarget, inValue: Quaternion): void {
	target.writeProperty('x', inValue.x)
	target.writeProperty('y', inValue.y)
	target.writeProperty('z', inValue.z)
	target.writeProperty('w', inValue.w)
}

export const RotationInputPluginQuaternion: InputBindingPlugin<
	Quaternion,
	Quaternion,
	RotationInputPluginQuaternionParams
> = createPlugin({
	accept(exValue: unknown, params: Record<string, unknown>) {
		// Parse parameters object
		const result = parseRecord<RotationInputPluginQuaternionParams>(params, (p) => ({
			expanded: p.optional.boolean,
			label: p.optional.string,
			picker: p.optional.custom(parsePickerLayout),
			rotationMode: p.optional.constant('quaternion'),
			view: p.required.constant('rotation'),
			w: p.optional.custom(parsePointDimensionParams),
			x: p.optional.custom(parsePointDimensionParams),
			y: p.optional.custom(parsePointDimensionParams),
			z: p.optional.custom(parsePointDimensionParams),
		}))

		return result
			? {
					initialValue: parseQuaternion(exValue),
					params: result,
				}
			: null
	},
	binding: {
		constraint({ params }) {
			return new PointNdConstraint({
				assembly: QuaternionAssembly,
				components: [
					createDimensionConstraint('x' in params ? params.x : undefined),
					createDimensionConstraint('y' in params ? params.y : undefined),
					createDimensionConstraint('z' in params ? params.z : undefined),
					createDimensionConstraint('w' in params ? params.w : undefined),
				],
			})
		},
		reader() {
			return parseQuaternion
		},
		writer() {
			return writeQuaternion
		},
	},
	controller({ constraint, document, params, value, viewProps }) {
		if (!(constraint instanceof PointNdConstraint)) {
			throw TpError.shouldNeverHappen()
		}

		const expanded = 'expanded' in params ? params.expanded : undefined
		const picker = 'picker' in params ? params.picker : undefined

		return new RotationInputController(document, {
			assembly: QuaternionAssembly,
			axes: [
				createAxisQuaternion(constraint.components[0]),
				createAxisQuaternion(constraint.components[1]),
				createAxisQuaternion(constraint.components[2]),
				createAxisQuaternion(constraint.components[3]),
			],
			expanded: expanded ?? false,
			parser: parseNumber,
			pickerLayout: picker ?? 'popup',
			rotationMode: 'quaternion',
			value,
			viewProps,
		}) as unknown as ValueController<Quaternion> // TODO;
	},
	id: 'rotation',
	type: 'input',
})
