import type { TpPlugin } from 'tweakpane'
import { RotationInputPluginEuler } from './rotation-input-plugin-euler'
import { RotationInputPluginQuaternion } from './rotation-input-plugin-quaternion'
import pluginCss from './styles/plugin.scss?inline'

export const id = 'rotation'

export const css: string = pluginCss

export const plugins: TpPlugin[] = [RotationInputPluginEuler, RotationInputPluginQuaternion]

export type { EulerOrder } from './euler-order'
export type { EulerUnit } from './euler-unit'

export { RotationInputPluginEuler } from './rotation-input-plugin-euler'
export type { RotationInputPluginEulerParams } from './rotation-input-plugin-euler-params'
export { RotationInputPluginQuaternion } from './rotation-input-plugin-quaternion'
export type { RotationInputPluginQuaternionParams } from './rotation-input-plugin-quaternion-params'
