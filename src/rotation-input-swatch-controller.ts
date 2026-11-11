import type { Controller, Value, ViewProps } from '@tweakpane/core'
import type { Rotation } from './rotation'
import type { RotationInputSwatchControllerConfig } from './rotation-input-swatch-controller-config'
import { RotationInputSwatchView } from './rotation-input-swatch-view'

export class RotationInputSwatchController implements Controller<RotationInputSwatchView> {
	public readonly value: Value<Rotation>
	public readonly view: RotationInputSwatchView
	public readonly viewProps: ViewProps

	public constructor(doc: Document, config: RotationInputSwatchControllerConfig) {
		this.value = config.value
		this.viewProps = config.viewProps

		this.view = new RotationInputSwatchView(doc, {
			value: this.value,
			viewProps: this.viewProps,
		})
	}
}
