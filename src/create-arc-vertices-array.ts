import { Vector3 } from './vector3'

/**
 * Points along a circular arc of `radius` in the plane spanned by `cosAxis` and
 * `sinAxis`.
 */
export function createArcVerticesArray(
	thetaStart: number,
	thetaLength: number,
	segments: number,
	cosAxis: 'x' | 'y' | 'z',
	sinAxis: 'x' | 'y' | 'z',
	radius = 1,
): Vector3[] {
	const vertices: Vector3[] = []

	for (let i = 0; i < segments; i++) {
		const t = thetaStart + (thetaLength * i) / (segments - 1)
		const vector = new Vector3()
		vector[cosAxis] = radius * Math.cos(t)
		vector[sinAxis] = radius * Math.sin(t)
		vertices.push(vector)
	}

	return vertices
}
