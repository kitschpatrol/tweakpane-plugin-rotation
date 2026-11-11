import type { Controller, PointNdAssembly, Value, ViewProps } from '@tweakpane/core'
import {
	bindFoldable,
	connectValues,
	findNextTarget,
	Foldable,
	forceCast,
	PointNdTextController,
	PopupController,
	supportsTouch,
} from '@tweakpane/core'
import type { Rotation } from './rotation'
import type { RotationInputControllerConfig } from './rotation-input-controller-config'
import { RotationInputGizmoController } from './rotation-input-gizmo-controller'
import { RotationInputSwatchController } from './rotation-input-swatch-controller'
import { RotationInputView } from './rotation-input-view'

export class RotationInputController implements Controller<RotationInputView> {
	public readonly value: Value<Rotation>
	public readonly view: RotationInputView
	public readonly viewProps: ViewProps
	private readonly foldable_: Foldable
	private readonly gizmoC_: RotationInputGizmoController
	private readonly popC_: null | PopupController
	private readonly swatchC_: RotationInputSwatchController
	private readonly textC_: PointNdTextController<Rotation>

	public constructor(doc: Document, config: RotationInputControllerConfig) {
		this.onButtonBlur_ = this.onButtonBlur_.bind(this)
		this.onButtonClick_ = this.onButtonClick_.bind(this)
		this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this)
		this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this)

		this.value = config.value
		this.viewProps = config.viewProps

		this.foldable_ = Foldable.create(config.expanded)

		this.swatchC_ = new RotationInputSwatchController(doc, {
			value: this.value,
			viewProps: this.viewProps,
		})
		const { buttonElement } = this.swatchC_.view
		buttonElement.addEventListener('blur', this.onButtonBlur_)
		buttonElement.addEventListener('click', this.onButtonClick_)

		this.textC_ = new PointNdTextController(doc, {
			assembly: config.assembly as unknown as PointNdAssembly<Rotation>, // TODO: resolve type puzzle
			axes: config.axes,
			parser: config.parser,
			value: this.value,
			viewProps: this.viewProps,
		})

		this.view = new RotationInputView(doc, {
			foldable: this.foldable_,
			pickerLayout: config.pickerLayout,
			rotationMode: config.rotationMode,
		})
		this.view.swatchElement.append(this.swatchC_.view.element)
		this.view.textElement.append(this.textC_.view.element)

		this.popC_ =
			config.pickerLayout === 'popup'
				? new PopupController(doc, {
						viewProps: this.viewProps,
					})
				: null

		const gizmoC = new RotationInputGizmoController(doc, {
			pickerLayout: config.pickerLayout,
			value: this.value,
			viewProps: this.viewProps,
		})
		for (const element of gizmoC.view.allFocusableElements) {
			element.addEventListener('blur', this.onPopupChildBlur_)
			element.addEventListener('keydown', this.onPopupChildKeydown_)
		}

		this.gizmoC_ = gizmoC

		if (this.popC_) {
			this.view.element.append(this.popC_.view.element)
			this.popC_.view.element.append(gizmoC.view.element)

			connectValues<boolean, boolean>({
				backward: (_, s) => s,
				forward: (p) => p,
				primary: this.foldable_.value('expanded'),
				secondary: this.popC_.shows,
			})
		} else if (this.view.pickerElement) {
			this.view.pickerElement.append(this.gizmoC_.view.element)

			bindFoldable(this.foldable_, this.view.pickerElement)
		}
	}

	private onButtonBlur_(event: FocusEvent): void {
		if (!this.popC_) {
			return
		}

		const { element } = this.view
		const nextTarget: HTMLElement | null = forceCast(event.relatedTarget)
		if (!nextTarget || !element.contains(nextTarget)) {
			this.popC_.shows.rawValue = false
		}
	}

	private onButtonClick_(): void {
		this.foldable_.set('expanded', !this.foldable_.get('expanded'))
		if (this.foldable_.get('expanded')) {
			this.gizmoC_.view.allFocusableElements[0]?.focus()
		}
	}

	private onPopupChildBlur_(event: FocusEvent): void {
		if (!this.popC_) {
			return
		}

		const { element } = this.popC_.view
		const nextTarget = findNextTarget(event)
		if (nextTarget && element.contains(nextTarget)) {
			// Next target is in the picker
			return
		}

		if (
			nextTarget &&
			nextTarget === this.swatchC_.view.buttonElement &&
			!supportsTouch(element.ownerDocument)
		) {
			// Next target is the trigger button
			return
		}

		this.popC_.shows.rawValue = false
	}

	private onPopupChildKeydown_(event: KeyboardEvent): void {
		if (this.popC_) {
			if (event.key === 'Escape') {
				this.popC_.shows.rawValue = false
			}
		} else if (this.view.pickerElement && event.key === 'Escape') {
			this.swatchC_.view.buttonElement.focus()
		}
	}
}
