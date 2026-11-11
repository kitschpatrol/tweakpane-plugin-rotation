import type { BindingParams } from 'tweakpane'
import { Pane } from 'tweakpane'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as plugin from '../src/index'
import { RotationInputPluginEuler, RotationInputPluginQuaternion } from '../src/index'

describe('rotation plugin', () => {
	let pane: Pane | undefined

	afterEach(() => {
		pane?.dispose()
		vi.useRealTimers()
	})

	function setup<T extends Record<string, number>>(initial: T, options: BindingParams) {
		type Change = { last: boolean; value: Record<string, number> }
		pane = new Pane()
		pane.registerPlugin(plugin)
		const params = { rotation: initial }
		const binding = pane.addBinding(params, 'rotation', { view: 'rotation', ...options })
		const inputs = [...binding.element.querySelectorAll('input')]
		const swatchButton = binding.element.querySelector('button')
		const pad = binding.element.querySelector<HTMLElement>('.tp-rotationgizmov_p')
		if (swatchButton === null || pad === null) {
			throw new Error('The rotation view was not created')
		}

		const changes: Change[] = []
		binding.on('change', (event) => {
			changes.push({ last: event.last, value: { ...event.value } })
		})

		return { binding, changes, inputs, pad, pane, params, swatchButton }
	}

	function commit(input: HTMLInputElement | undefined, text: string): void {
		if (input === undefined) {
			throw new Error('Missing text input')
		}

		input.value = text
		input.dispatchEvent(new Event('change', { bubbles: true }))
	}

	describe('accept', () => {
		it('accepts Euler values only with the rotation view and euler rotation mode', () => {
			const result = RotationInputPluginEuler.accept(
				{ x: 1, y: 2, z: 3 },
				{ order: 'ZYX', rotationMode: 'euler', unit: 'deg', view: 'rotation' },
			)
			expect(result?.initialValue.getComponents()).toEqual([1, 2, 3])
			expect(result?.initialValue.order).toBe('ZYX')
			expect(result?.initialValue.unit).toBe('deg')
			expect(result?.params.order).toBe('ZYX')

			const defaults = RotationInputPluginEuler.accept(
				{ x: 1, y: 2, z: 3 },
				{ rotationMode: 'euler', view: 'rotation' },
			)
			expect(defaults?.initialValue.order).toBe('XYZ')
			expect(defaults?.initialValue.unit).toBe('rad')
		})

		it.each<[string, Record<string, unknown>]>([
			['no view', { rotationMode: 'euler' }],
			['another view', { rotationMode: 'euler', view: 'color' }],
			['no rotation mode', { view: 'rotation' }],
			['the quaternion rotation mode', { rotationMode: 'quaternion', view: 'rotation' }],
			['an unknown order', { order: 'XXY', rotationMode: 'euler', view: 'rotation' }],
			['an unknown unit', { rotationMode: 'euler', unit: 'grad', view: 'rotation' }],
			['an unknown picker', { picker: 'sideways', rotationMode: 'euler', view: 'rotation' }],
			['a non-boolean expanded', { expanded: 'yes', rotationMode: 'euler', view: 'rotation' }],
			['invalid dimension params', { rotationMode: 'euler', view: 'rotation', x: { min: 'a' } }],
		])('rejects Euler params with %s', (_, params) => {
			expect(RotationInputPluginEuler.accept({ x: 0, y: 0, z: 0 }, params)).toBeNull()
		})

		it('accepts quaternion values with the rotation view and an optional rotation mode', () => {
			const value = { x: 0.5, y: 0.5, z: 0.5, w: 0.5 }
			const implicit = RotationInputPluginQuaternion.accept(value, { view: 'rotation' })
			expect(implicit?.initialValue.getComponents()).toEqual([0.5, 0.5, 0.5, 0.5])

			const explicit = RotationInputPluginQuaternion.accept(value, {
				rotationMode: 'quaternion',
				view: 'rotation',
			})
			expect(explicit?.params.rotationMode).toBe('quaternion')
		})

		it.each<[string, Record<string, unknown>]>([
			['no view', {}],
			['another view', { view: 'color' }],
			['the euler rotation mode', { rotationMode: 'euler', view: 'rotation' }],
			['an unknown picker', { picker: 'sideways', view: 'rotation' }],
			['invalid dimension params', { view: 'rotation', w: { max: 'a' } }],
		])('rejects quaternion params with %s', (_, params) => {
			expect(RotationInputPluginQuaternion.accept({ x: 0, y: 0, z: 0, w: 1 }, params)).toBeNull()
		})
	})

	it('registers both plugins and installs the compiled styles', () => {
		setup({ x: 0, y: 0, z: 0 }, { rotationMode: 'euler' })
		expect(plugin.id).toBe('rotation')
		expect(plugin.plugins).toEqual([RotationInputPluginEuler, RotationInputPluginQuaternion])
		expect(plugin.css).toContain('.tp-rotationv')
		expect(plugin.css).toContain('.tp-rotationgizmov')
		expect(plugin.css).not.toContain('@use')
		expect(document.head.textContent).toContain('.tp-rotationv')
	})

	describe('Euler binding', () => {
		it('shows one text input per angle, formatted for the unit', () => {
			const { inputs } = setup({ x: 90, y: -45, z: 0 }, { rotationMode: 'euler', unit: 'deg' })
			expect(inputs.map((input) => input.value)).toEqual(['90', '-45', '0'])
		})

		it('writes edited angles to the bound object and emits a final change', () => {
			const { changes, inputs, params } = setup(
				{ x: 0, y: 0, z: 0 },
				{ rotationMode: 'euler', unit: 'deg' },
			)
			commit(inputs[1], '45')
			expect(params.rotation).toEqual({ x: 0, y: 45, z: 0 })
			expect(changes.at(-1)).toEqual({ last: true, value: { x: 0, y: 45, z: 0 } })
		})

		it('ignores text that does not parse as a number', () => {
			const { changes, inputs, params } = setup(
				{ x: 10, y: 20, z: 30 },
				{ rotationMode: 'euler', unit: 'deg' },
			)
			commit(inputs[0], 'abc')
			expect(params.rotation).toEqual({ x: 10, y: 20, z: 30 })
			expect(changes).toEqual([])
			expect(inputs[0]?.value).toBe('10')
		})

		it('applies per-axis constraints to edited angles', () => {
			const { inputs, params } = setup(
				{ x: 0, y: 0, z: 0 },
				{ rotationMode: 'euler', unit: 'deg', x: { min: -30, max: 30 } },
			)
			commit(inputs[0], '75')
			expect(params.rotation.x).toBe(30)
		})

		it('emits intermediate changes while stepping with arrow keys', () => {
			const { changes, inputs, params } = setup(
				{ x: 0, y: 0, z: 0 },
				{ rotationMode: 'euler', unit: 'deg' },
			)
			const input = inputs[2]
			input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }))
			input?.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'ArrowUp' }))
			expect(params.rotation.z).toBe(1)
			expect(changes.map(({ last }) => last)).toEqual([false, true])
		})

		it('shows external changes after a refresh', () => {
			const { binding, inputs, params } = setup(
				{ x: 0, y: 0, z: 0 },
				{ rotationMode: 'euler', unit: 'rad' },
			)
			params.rotation.x = Math.PI / 2
			params.rotation.z = -1.234
			binding.refresh()
			expect(inputs.map((input) => input.value)).toEqual(['1.57', '0.00', '-1.23'])
		})

		it('rotates the swatch and gizmo graphics when the value changes', () => {
			const { binding, params } = setup({ x: 0, y: 0, z: 0 }, { rotationMode: 'euler' })
			const paths = [...binding.element.querySelectorAll('path[class^="tp-rotation"]')]
			const before = paths.map((path) => path.getAttribute('d'))
			params.rotation.x = 1
			binding.refresh()
			const after = paths.map((path) => path.getAttribute('d'))
			expect(paths).not.toHaveLength(0)
			expect(before.every((d) => d?.startsWith('M'))).toBe(true)
			expect(after.every((d) => d?.startsWith('M'))).toBe(true)
			expect(after).not.toEqual(before)
		})
	})

	describe('quaternion binding', () => {
		it('writes edited components to the bound object without normalizing', () => {
			const { changes, inputs, params } = setup({ x: 0, y: 0, z: 0, w: 1 }, {})
			expect(inputs).toHaveLength(4)
			commit(inputs[0], '0.5')
			expect(params.rotation).toEqual({ x: 0.5, y: 0, z: 0, w: 1 })
			expect(changes.at(-1)?.last).toBe(true)
		})

		it('shows external changes after a refresh using the compact format', () => {
			const { binding, inputs, params } = setup(
				{ x: 0, y: 0, z: 0, w: 1 },
				{ rotationMode: 'quaternion' },
			)
			params.rotation.z = -Math.SQRT1_2
			params.rotation.w = Math.SQRT1_2
			binding.refresh()
			expect(inputs.map((input) => input.value)).toEqual(['.00', '.00', '-.71', '.71'])
			params.rotation.z = 0
			params.rotation.w = 1
			binding.refresh()
			expect(inputs[3]?.value).toBe('1.0')
		})

		it('rotates by a fixed step when arrow keys are pressed on the gizmo', () => {
			const { changes, pad, params } = setup({ x: 0, y: 0, z: 0, w: 1 }, {})
			pad.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))
			expect(params.rotation.x).toBeCloseTo(0)
			expect(params.rotation.y).toBeCloseTo(Math.sin(Math.PI / 32))
			expect(params.rotation.z).toBeCloseTo(0)
			expect(params.rotation.w).toBeCloseTo(Math.cos(Math.PI / 32))
			expect(changes).toHaveLength(1)

			pad.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }))
			expect(changes).toHaveLength(1)
		})
	})

	describe('gizmo', () => {
		function mouse(target: EventTarget, type: string, pageX: number, pageY: number): void {
			const event = new MouseEvent(type, { bubbles: true })
			// Happy-dom has no layout, so it reports zero page coordinates.
			Object.defineProperties(event, { pageX: { value: pageX }, pageY: { value: pageY } })
			target.dispatchEvent(event)
		}

		it('rotates freely while dragging on the pad and stops on release', () => {
			const { pad, params } = setup({ x: 0, y: 0, z: 0, w: 1 }, {})
			mouse(pad, 'mousedown', 0, 0)
			mouse(document, 'mousemove', 68, 0)
			expect(params.rotation.x).toBeCloseTo(0)
			expect(params.rotation.y).toBeCloseTo(Math.sin(0.5))
			expect(params.rotation.z).toBeCloseTo(0)
			expect(params.rotation.w).toBeCloseTo(Math.cos(0.5))
			mouse(document, 'mouseup', 68, 0)
			const released = { ...params.rotation }
			mouse(document, 'mousemove', 0, 68)
			expect(params.rotation).toEqual(released)
		})

		it('rotates about a single axis while dragging its arc', () => {
			const { binding, params } = setup({ x: 0, y: 0, z: 0, w: 1 }, {})
			const [arcHitArea] = binding.element.querySelectorAll('.tp-rotationgizmov_arcc')
			const [xArc] = binding.element.querySelectorAll('.tp-rotationgizmov_arcx')
			if (arcHitArea === undefined || xArc === undefined) {
				throw new Error('Missing gizmo arcs')
			}

			mouse(arcHitArea, 'mousedown', 10, 0)
			expect(xArc.classList.contains('tp-rotationgizmov_arcx_active')).toBe(true)
			mouse(document, 'mousemove', 0, 10)
			expect(params.rotation.x).toBeCloseTo(Math.SQRT1_2)
			expect(params.rotation.y).toBeCloseTo(0)
			expect(params.rotation.z).toBeCloseTo(0)
			expect(params.rotation.w).toBeCloseTo(Math.SQRT1_2)
			mouse(document, 'mouseup', 0, 10)
			expect(xArc.classList.contains('tp-rotationgizmov_arcx_active')).toBe(false)
		})

		it('rolls about the view axis while dragging the outer ring', () => {
			const { binding, params } = setup({ x: 0, y: 0, z: 0, w: 1 }, {})
			const ringHitArea = [...binding.element.querySelectorAll('.tp-rotationgizmov_arcc')].at(-1)
			const ring = binding.element.querySelector('.tp-rotationgizmov_arcr')
			if (ringHitArea === undefined || ring === null) {
				throw new Error('Missing gizmo ring')
			}

			mouse(ringHitArea, 'mousedown', 10, 0)
			expect(ring.classList.contains('tp-rotationgizmov_arcr_active')).toBe(true)
			mouse(document, 'mousemove', 0, 10)
			expect(params.rotation.x).toBeCloseTo(0)
			expect(params.rotation.y).toBeCloseTo(0)
			expect(params.rotation.z).toBeCloseTo(-Math.SQRT1_2)
			expect(params.rotation.w).toBeCloseTo(Math.SQRT1_2)
			mouse(document, 'mouseup', 0, 10)
			expect(ring.classList.contains('tp-rotationgizmov_arcr_active')).toBe(false)
		})

		it('animates to an axis view when its label is pressed', () => {
			vi.useFakeTimers()
			const { binding, changes, params } = setup({ x: 0, y: 0, z: 0, w: 1 }, {})
			const xLabel = [...binding.element.querySelectorAll('.tp-rotationgizmov_labeltext')].find(
				(text) => text.textContent === 'X',
			)?.parentNode
			if (xLabel === undefined || xLabel === null) {
				throw new Error('Missing X label')
			}

			mouse(xLabel, 'mousedown', 0, 0)
			vi.advanceTimersByTime(150)
			expect(params.rotation.y).toBeLessThan(0)
			expect(params.rotation.y).toBeGreaterThan(-Math.SQRT1_2)
			const beforeEnd = changes.length
			vi.advanceTimersByTime(300)
			expect(changes.length).toBeGreaterThan(beforeEnd)
			expect(params.rotation.x).toBeCloseTo(0)
			expect(params.rotation.y).toBeCloseTo(-Math.SQRT1_2)
			expect(params.rotation.z).toBeCloseTo(0)
			expect(params.rotation.w).toBeCloseTo(Math.SQRT1_2)
		})
	})

	describe('picker', () => {
		it('opens the popup picker from the swatch button and closes it with Escape', () => {
			const { binding, pad, swatchButton } = setup({ x: 0, y: 0, z: 0, w: 1 }, {})
			const popup = binding.element.querySelector('.tp-popv')
			expect(popup?.contains(pad)).toBe(true)
			expect(popup?.classList.contains('tp-popv-v')).toBe(false)
			swatchButton.click()
			expect(popup?.classList.contains('tp-popv-v')).toBe(true)
			pad.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
			expect(popup?.classList.contains('tp-popv-v')).toBe(false)
		})

		it('places an inline picker below the text inputs and toggles it from the swatch', () => {
			const { binding, pad, swatchButton } = setup(
				{ x: 0, y: 0, z: 0, w: 1 },
				{ expanded: true, picker: 'inline' },
			)
			const root = binding.element.querySelector('.tp-rotationv')
			expect(binding.element.querySelector('.tp-popv')).toBeNull()
			expect(binding.element.querySelector('.tp-rotationv_g')?.contains(pad)).toBe(true)
			expect(root?.classList.contains('tp-rotationv-expanded')).toBe(true)
			swatchButton.click()
			expect(root?.classList.contains('tp-rotationv-expanded')).toBe(false)
		})
	})

	it('disables the text inputs, swatch, and gizmo with the pane', () => {
		const {
			inputs,
			pad,
			pane: currentPane,
			swatchButton,
		} = setup(
			{ x: 0, y: 0, z: 0 },
			{
				rotationMode: 'euler',
			},
		)
		expect(pad.tabIndex).toBe(0)
		currentPane.disabled = true
		expect(inputs.every((input) => input.disabled)).toBe(true)
		expect(swatchButton.disabled).toBe(true)
		expect(pad.tabIndex).toBe(-1)
		currentPane.disabled = false
		expect(inputs.every((input) => input.disabled)).toBe(false)
		expect(swatchButton.disabled).toBe(false)
		expect(pad.tabIndex).toBe(0)
	})

	it('removes the view and stops refreshing when the binding is disposed', () => {
		const {
			binding,
			changes,
			pane: currentPane,
			params,
		} = setup({ x: 0, y: 0, z: 0 }, { rotationMode: 'euler' })
		const { element } = binding
		expect(element.isConnected).toBe(true)
		binding.dispose()
		expect(element.isConnected).toBe(false)
		expect(currentPane.children).not.toContain(binding)
		params.rotation.x = 1
		currentPane.refresh()
		expect(changes).toEqual([])
	})
})
