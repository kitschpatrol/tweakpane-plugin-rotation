import type {
	Controller,
	PointerData,
	PointerHandlerEvents,
	Value,
	ViewProps,
} from '@tweakpane/core'
import {
	createValue,
	getHorizontalStepKeys,
	getStepForKey,
	getVerticalStepKeys,
	isArrowKey,
	PointerHandler,
} from '@tweakpane/core'
import type { Rotation } from './rotation'
import type { RotationInputGizmoControllerConfig } from './rotation-input-gizmo-controller-config'
import { Quaternion } from './quaternion'
import { RotationInputGizmoView } from './rotation-input-gizmo-view'
import { iikanjiEaseout } from './utils/iikanji-easeout'
import { linearstep } from './utils/linearstep'
import { sanitizeAngle } from './utils/sanitize-angle'
import { Vector3 } from './vector3'

const INV_SQRT2 = Math.SQRT1_2
const VEC3_XP = new Vector3(1, 0, 0)
const VEC3_YP = new Vector3(0, 1, 0)
const VEC3_ZP = new Vector3(0, 0, 1)
const QUAT_IDENTITY = new Quaternion(0, 0, 0, 1)
const QUAT_TOP = new Quaternion(INV_SQRT2, 0, 0, INV_SQRT2)
const QUAT_RIGHT = new Quaternion(0, -INV_SQRT2, 0, INV_SQRT2)
const QUAT_BOTTOM = new Quaternion(-INV_SQRT2, 0, 0, INV_SQRT2)
const QUAT_LEFT = new Quaternion(0, INV_SQRT2, 0, INV_SQRT2)
const QUAT_BACK = new Quaternion(0, 1, 0, 0)

export class RotationInputGizmoController implements Controller<RotationInputGizmoView> {
	public readonly value: Value<Rotation>
	public readonly view: RotationInputGizmoView
	public readonly viewProps: ViewProps
	private angleState_: null | {
		axis: Vector3
		initialAngle: number
		initialRotation: Rotation
		reverseAngle: boolean
	}
	private readonly mode_: Value<'angle-r' | 'angle-x' | 'angle-y' | 'angle-z' | 'auto' | 'free'>
	private readonly ptHandler_: PointerHandler
	private px_: null | number
	private py_: null | number

	public constructor(doc: Document, config: RotationInputGizmoControllerConfig) {
		this.onPadKeyDown_ = this.onPadKeyDown_.bind(this)
		this.onPointerDown_ = this.onPointerDown_.bind(this)
		this.onPointerMove_ = this.onPointerMove_.bind(this)
		this.onPointerUp_ = this.onPointerUp_.bind(this)

		this.value = config.value
		this.viewProps = config.viewProps

		this.mode_ = createValue('free')

		this.view = new RotationInputGizmoView(doc, {
			mode: this.mode_,
			pickerLayout: config.pickerLayout,
			value: this.value,
			viewProps: this.viewProps,
		})

		this.ptHandler_ = new PointerHandler(this.view.padElement)
		this.ptHandler_.emitter.on('down', this.onPointerDown_)
		this.ptHandler_.emitter.on('move', this.onPointerMove_)
		this.ptHandler_.emitter.on('up', this.onPointerUp_)

		this.view.padElement.addEventListener('keydown', this.onPadKeyDown_)

		const ptHandlerXArcB = new PointerHandler(this.view.xArcBElement as unknown as HTMLElement)
		ptHandlerXArcB.emitter.on('down', () => {
			this.changeModeIfNotAuto_('angle-x')
		})
		ptHandlerXArcB.emitter.on('up', () => {
			this.changeModeIfNotAuto_('free')
		})

		const ptHandlerXArcF = new PointerHandler(this.view.xArcFElement as unknown as HTMLElement)
		ptHandlerXArcF.emitter.on('down', () => {
			this.changeModeIfNotAuto_('angle-x')
		})
		ptHandlerXArcF.emitter.on('up', () => {
			this.changeModeIfNotAuto_('free')
		})

		const ptHandlerYArcB = new PointerHandler(this.view.yArcBElement as unknown as HTMLElement)
		ptHandlerYArcB.emitter.on('down', () => {
			this.changeModeIfNotAuto_('angle-y')
		})
		ptHandlerYArcB.emitter.on('up', () => {
			this.changeModeIfNotAuto_('free')
		})

		const ptHandlerYArcF = new PointerHandler(this.view.yArcFElement as unknown as HTMLElement)
		ptHandlerYArcF.emitter.on('down', () => {
			this.changeModeIfNotAuto_('angle-y')
		})
		ptHandlerYArcF.emitter.on('up', () => {
			this.changeModeIfNotAuto_('free')
		})

		const ptHandlerZArcB = new PointerHandler(this.view.zArcBElement as unknown as HTMLElement)
		ptHandlerZArcB.emitter.on('down', () => {
			this.changeModeIfNotAuto_('angle-z')
		})
		ptHandlerZArcB.emitter.on('up', () => {
			this.changeModeIfNotAuto_('free')
		})

		const ptHandlerZArcF = new PointerHandler(this.view.zArcFElement as unknown as HTMLElement)
		ptHandlerZArcF.emitter.on('down', () => {
			this.changeModeIfNotAuto_('angle-z')
		})
		ptHandlerZArcF.emitter.on('up', () => {
			this.changeModeIfNotAuto_('free')
		})

		const ptHandlerRArc = new PointerHandler(this.view.rArcElement as unknown as HTMLElement)
		ptHandlerRArc.emitter.on('down', () => {
			this.changeModeIfNotAuto_('angle-r')
		})
		ptHandlerRArc.emitter.on('up', () => {
			this.changeModeIfNotAuto_('free')
		})

		for (const { el, q } of [
			{ el: this.view.xLabel, q: QUAT_RIGHT },
			{ el: this.view.yLabel, q: QUAT_TOP },
			{ el: this.view.zLabel, q: QUAT_IDENTITY },
			{ el: this.view.xnLabel, q: QUAT_LEFT },
			{ el: this.view.ynLabel, q: QUAT_BOTTOM },
			{ el: this.view.znLabel, q: QUAT_BACK },
		]) {
			const ptHandler = new PointerHandler(el as unknown as HTMLElement)
			ptHandler.emitter.on('down', () => {
				this.autoRotate_(q)
			})
		}

		this.px_ = null
		this.py_ = null
		this.angleState_ = null
	}

	private autoRotate_(to: Quaternion): void {
		this.mode_.rawValue = 'auto'

		const from = this.value.rawValue
		const beginTime = Date.now()

		const update = (): void => {
			const now = Date.now()
			const t = iikanjiEaseout(linearstep(0, 300, now - beginTime))

			this.value.rawValue = from.slerp(to, t)

			if (t === 1) {
				this.mode_.rawValue = 'free'
				return
			}

			requestAnimationFrame(update)
		}

		requestAnimationFrame(update)
	}

	private changeModeIfNotAuto_(mode: 'angle-r' | 'angle-x' | 'angle-y' | 'angle-z' | 'free'): void {
		if (this.mode_.rawValue !== 'auto') {
			this.mode_.rawValue = mode
		}
	}

	private handlePointerEvent_(d: PointerData): void {
		if (!d.point) {
			return
		}

		const mode = this.mode_.rawValue

		const { x } = d.point
		const { y } = d.point

		switch (mode) {
			case 'angle-r': {
				const cx = d.bounds.width / 2
				const cy = d.bounds.height / 2
				const angle = Math.atan2(y - cy, x - cx)

				if (this.angleState_ === null) {
					const axis = new Vector3(0, 0, 1)

					this.angleState_ = {
						axis,
						initialAngle: angle,
						initialRotation: this.value.rawValue,
						reverseAngle: true,
					}
				} else {
					const { axis, initialAngle, initialRotation } = this.angleState_

					const angleDiff = -sanitizeAngle(angle - initialAngle)
					const quat = Quaternion.fromAxisAngle(axis, angleDiff)
					this.value.rawValue = initialRotation.premultiply(quat)
				}

				break
			}

			case 'auto': {
				// Do nothing

				break
			}

			case 'free': {
				if (this.px_ !== null && this.py_ !== null) {
					const dx = x - this.px_
					const dy = y - this.py_
					const l = Math.hypot(dx, dy)
					if (l === 0) {
						return
					}

					const axis = new Vector3(dy / l, dx / l, 0)
					const quat = Quaternion.fromAxisAngle(axis, l / 68)
					this.value.rawValue = this.value.rawValue.premultiply(quat)
				}

				this.px_ = x
				this.py_ = y

				break
			}

			case 'angle-x':
			case 'angle-y':
			case 'angle-z': {
				const cx = d.bounds.width / 2
				const cy = d.bounds.height / 2
				const angle = Math.atan2(y - cy, x - cx)

				if (this.angleState_ === null) {
					const axis = mode === 'angle-x' ? VEC3_XP : mode === 'angle-y' ? VEC3_YP : VEC3_ZP

					const reverseAngle = axis.applyQuaternion(this.value.rawValue.quat).z > 0

					this.angleState_ = {
						axis,
						initialAngle: angle,
						initialRotation: this.value.rawValue,
						reverseAngle,
					}
				} else {
					const { axis, initialAngle, initialRotation, reverseAngle } = this.angleState_

					let angleDiff = sanitizeAngle(angle - initialAngle)
					angleDiff = reverseAngle ? -angleDiff : angleDiff
					const quat = Quaternion.fromAxisAngle(axis, angleDiff)
					this.value.rawValue = initialRotation.multiply(quat)
				}
			}
		}
	}

	private onPadKeyDown_(event: KeyboardEvent): void {
		if (isArrowKey(event.key)) {
			event.preventDefault()
		}

		const x = getStepForKey(1, getHorizontalStepKeys(event))
		const y = getStepForKey(1, getVerticalStepKeys(event))

		if (x === 0 && y === 0) {
			return
		}

		const axis = new Vector3(-y, x, 0)
		const quat = Quaternion.fromAxisAngle(axis, Math.PI / 16)
		this.value.rawValue = this.value.rawValue.premultiply(quat)
	}

	private onPointerDown_(event: PointerHandlerEvents['down']): void {
		this.handlePointerEvent_(event.data)
	}

	private onPointerMove_(event: PointerHandlerEvents['move']): void {
		this.handlePointerEvent_(event.data)
	}

	private onPointerUp_(): void {
		this.px_ = null
		this.py_ = null
		this.angleState_ = null
	}
}
