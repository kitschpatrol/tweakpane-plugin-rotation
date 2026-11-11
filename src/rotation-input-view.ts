import type { View } from '@tweakpane/core'
import { bindValueMap, ClassName, valueToClassName } from '@tweakpane/core'
import type { RotationInputViewConfig } from './rotation-input-view-config'

const className = ClassName('rotation')

export class RotationInputView implements View {
	public readonly element: HTMLElement
	public readonly pickerElement: HTMLElement | null
	public readonly swatchElement: HTMLElement
	public readonly textElement: HTMLElement

	public constructor(doc: Document, config: RotationInputViewConfig) {
		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.foldable.bindExpandedClass(this.element, className(undefined, 'expanded'))
		bindValueMap(
			config.foldable,
			'completed',
			valueToClassName(this.element, className(undefined, 'cpl')),
		)

		if (config.rotationMode === 'quaternion') {
			this.element.classList.add(className('quat'))
		}

		const headElement = doc.createElement('div')
		headElement.classList.add(className('h'))
		this.element.append(headElement)

		const swatchElement = doc.createElement('div')
		swatchElement.classList.add(className('s'))
		headElement.append(swatchElement)
		this.swatchElement = swatchElement

		const textElement = doc.createElement('div')
		textElement.classList.add(className('t'))
		headElement.append(textElement)
		this.textElement = textElement

		if (config.pickerLayout === 'inline') {
			const pickerElement = doc.createElement('div')
			pickerElement.classList.add(className('g'))
			this.element.append(pickerElement)
			this.pickerElement = pickerElement
		} else {
			this.pickerElement = null
		}
	}
}
