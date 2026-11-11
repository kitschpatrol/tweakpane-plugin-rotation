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
import type { Euler } from './euler'
import type { RotationInputPluginEulerParams } from './rotation-input-plugin-euler-params'
import { createAxisEuler } from './create-axis-euler'
import { createDimensionConstraint } from './create-dimension-constraint'
import { createEulerAssembly } from './create-euler-assembly'
import { parseEuler } from './parse-euler'
import { parseEulerOrder } from './parse-euler-order'
import { parseEulerUnit } from './parse-euler-unit'
import { RotationInputController } from './rotation-input-controller'

function writeEuler(target: BindingTarget, inValue: Euler): void {
	target.writeProperty('x', inValue.x)
	target.writeProperty('y', inValue.y)
	target.writeProperty('z', inValue.z)
}

export const RotationInputPluginEuler: InputBindingPlugin<
	Euler,
	Euler,
	RotationInputPluginEulerParams
> = createPlugin({
	accept(exValue: unknown, params: Record<string, unknown>) {
		// Parse parameters object
		const result = parseRecord<RotationInputPluginEulerParams>(params, (p) => ({
			expanded: p.optional.boolean,
			label: p.optional.string,
			order: p.optional.custom(parseEulerOrder),
			picker: p.optional.custom(parsePickerLayout),
			rotationMode: p.required.constant('euler'),
			unit: p.optional.custom(parseEulerUnit),
			view: p.required.constant('rotation'),
			x: p.optional.custom(parsePointDimensionParams),
			y: p.optional.custom(parsePointDimensionParams),
			z: p.optional.custom(parsePointDimensionParams),
		}))

		return result
			? {
					initialValue: parseEuler(exValue, result.order ?? 'XYZ', result.unit ?? 'rad'),
					params: result,
				}
			: null
	},
	binding: {
		constraint({ params }) {
			return new PointNdConstraint({
				assembly: createEulerAssembly(params.order ?? 'XYZ', params.unit ?? 'rad'),
				components: [
					createDimensionConstraint('x' in params ? params.x : undefined),
					createDimensionConstraint('y' in params ? params.y : undefined),
					createDimensionConstraint('z' in params ? params.z : undefined),
				],
			})
		},
		reader({ params }) {
			return (exValue: unknown): Euler =>
				parseEuler(exValue, params.order ?? 'XYZ', params.unit ?? 'rad')
		},
		writer() {
			return writeEuler
		},
	},
	controller({ constraint, document, params, value, viewProps }) {
		if (!(constraint instanceof PointNdConstraint)) {
			throw TpError.shouldNeverHappen()
		}

		const expanded = 'expanded' in params ? params.expanded : undefined
		const picker = 'picker' in params ? params.picker : undefined

		const unit = params.unit ?? 'rad'
		const digits = {
			deg: 0,
			rad: 2,
			turn: 2,
		}[unit]

		return new RotationInputController(document, {
			assembly: createEulerAssembly(params.order ?? 'XYZ', unit),
			axes: [
				createAxisEuler(digits, constraint.components[0]),
				createAxisEuler(digits, constraint.components[1]),
				createAxisEuler(digits, constraint.components[2]),
			],
			expanded: expanded ?? false,
			parser: parseNumber,
			pickerLayout: picker ?? 'popup',
			rotationMode: 'euler',
			value,
			viewProps,
		}) as unknown as ValueController<Euler> // TODO: resolve type puzzle
	},
	id: 'rotation',
	type: 'input',
})
