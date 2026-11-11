import type { Vector3 } from './vector3'

export class PointProjector {
	public aspect: number
	public fov: number
	public offset: [number, number, number]
	public viewport: [number, number, number, number]

	public constructor() {
		this.offset = [0, 0, -5]
		this.fov = 30
		this.aspect = 1
		this.viewport = [0, 0, 1, 1]
	}

	public project(v: Vector3): [number, number] {
		const vcx = (this.viewport[0] + this.viewport[2]) * 0.5
		const vcy = (this.viewport[1] + this.viewport[3]) * 0.5
		const vw = this.viewport[2] - this.viewport[0]
		const vh = this.viewport[3] - this.viewport[1]

		const p = 1 / Math.tan((this.fov * Math.PI) / 360)

		const sz = -(v.z + this.offset[2])
		const sx = vcx + (((v.x + this.offset[0]) / sz) * p * vw * 0.5) / this.aspect
		const sy = vcy - ((v.y + this.offset[1]) / sz) * p * vh * 0.5

		return [sx, sy]
	}
}
