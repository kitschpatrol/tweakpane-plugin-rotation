import { SVG_NS } from '@tweakpane/core'
import type { PointProjector } from './point-projector'
import type { Quaternion } from './quaternion'
import type { Vector3 } from './vector3'

export class SVGLineStrip {
	public element: SVGPathElement
	public projector: PointProjector
	public vertices: Vector3[]

	public constructor(doc: Document, vertices: Vector3[], projector: PointProjector) {
		this.element = doc.createElementNS(SVG_NS, 'path')
		this.vertices = vertices
		this.projector = projector
	}

	/**
	 * Make sure rotation is normalized!
	 */
	public setRotation(rotation: Quaternion): this {
		let pathString = ''

		for (const [iVertex, vertex] of this.vertices.entries()) {
			const transformed = vertex.applyQuaternion(rotation)
			const [sx, sy] = this.projector.project(transformed)
			const command = iVertex === 0 ? 'M' : 'L'
			pathString += `${command}${sx} ${sy}`
		}

		this.element.setAttributeNS(null, 'd', pathString)

		return this
	}
}
