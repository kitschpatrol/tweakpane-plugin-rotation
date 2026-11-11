import type { Value, View } from '@tweakpane/core'
import { ClassName, SVG_NS } from '@tweakpane/core'
import type { Rotation } from './rotation'
import type { RotationInputSwatchViewConfig } from './rotation-input-swatch-view-config'
import { createArcRotation } from './create-arc-rotation'
import { createArcVerticesArray } from './create-arc-vertices-array'
import { PointProjector } from './point-projector'
import { Quaternion } from './quaternion'
import { SVGLineStrip } from './svg-line-strip'
import { Vector3 } from './vector3'

const className = ClassName('rotationswatch')

const VEC3_XP = new Vector3(1, 0, 0)
const VEC3_YP = new Vector3(0, 1, 0)
const VEC3_ZP = new Vector3(0, 0, 1)
const QUAT_IDENTITY = new Quaternion(0, 0, 0, 1)

export class RotationInputSwatchView implements View {
	public readonly buttonElement: HTMLButtonElement
	public readonly element: HTMLElement
	public readonly value: Value<Rotation>
	private readonly projector_: PointProjector
	private readonly rArc_: SVGLineStrip
	private readonly xArc_: SVGLineStrip
	private readonly yArc_: SVGLineStrip
	private readonly zArc_: SVGLineStrip

	public constructor(doc: Document, config: RotationInputSwatchViewConfig) {
		this.onValueChange_ = this.onValueChange_.bind(this)

		config.value.emitter.on('change', this.onValueChange_)
		this.value = config.value

		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)

		const buttonElement = doc.createElement('button')
		buttonElement.classList.add(className('b'))
		config.viewProps.bindDisabled(buttonElement)
		this.element.append(buttonElement)
		this.buttonElement = buttonElement

		const svgElement = doc.createElementNS(SVG_NS, 'svg')
		svgElement.classList.add(className('g'))
		buttonElement.append(svgElement)

		this.projector_ = new PointProjector()
		this.projector_.viewport = [0, 0, 20, 20]

		const arcArray = createArcVerticesArray(0, Math.PI, 33, 'x', 'y')
		const arcArrayR = createArcVerticesArray(0, 2 * Math.PI, 65, 'x', 'y')

		// Arc
		this.rArc_ = new SVGLineStrip(doc, arcArrayR, this.projector_)
		this.rArc_.element.classList.add(className('arcr'))
		svgElement.append(this.rArc_.element)
		this.rArc_.setRotation(QUAT_IDENTITY)

		this.xArc_ = new SVGLineStrip(doc, arcArray, this.projector_)
		this.xArc_.element.classList.add(className('arc'))
		svgElement.append(this.xArc_.element)

		this.yArc_ = new SVGLineStrip(doc, arcArray, this.projector_)
		this.yArc_.element.classList.add(className('arc'))
		svgElement.append(this.yArc_.element)

		this.zArc_ = new SVGLineStrip(doc, arcArray, this.projector_)
		this.zArc_.element.classList.add(className('arc'))
		svgElement.append(this.zArc_.element)

		this.update_()
	}

	private onValueChange_(): void {
		this.update_()
	}

	private update_(): void {
		const q = this.value.rawValue.quat.normalized

		// Rotate axes
		const xp = VEC3_XP.applyQuaternion(q)
		const yp = VEC3_YP.applyQuaternion(q)
		const zp = VEC3_ZP.applyQuaternion(q)

		this.xArc_.setRotation(createArcRotation(xp, VEC3_ZP))
		this.yArc_.setRotation(createArcRotation(yp, VEC3_ZP))
		this.zArc_.setRotation(createArcRotation(zp, VEC3_ZP))
	}
}
