/** @module @qiwi/decorator-utils */

import reduce from 'lodash.reduce'
import type {} from 'reflect-metadata'

import { IDescriptor, IInstance, IProto, IReducible } from './interface'

export {default as get} from 'lodash.get'
export {default as set} from 'lodash.set'
export {default as once} from 'lodash.once'

export const isFunction = (fn: any): boolean =>
  typeof fn === 'function'

/**
 * Extracts prototype methods of instance.
 * @param {*} instance
 * @returns {Object}
 */
export function getPrototypeMethods(
  instance: IInstance,
): PropertyDescriptorMap {
  // WORKAROUND: empty object fallback
  const proto: IProto =
    instance.prototype || instance.constructor.prototype || {}
  const propNames: IReducible = Object.getOwnPropertyNames(proto)
  const memo: PropertyDescriptorMap = {}

  return reduce(
    propNames,
    (memo: { [key: string]: any }, name: string) => {
      const desc: IDescriptor | void = Object.getOwnPropertyDescriptor(
        proto,
        name,
      )

      if (
        desc &&
        isFunction(desc.value) &&
        desc.value !== instance.constructor &&
        desc.value !== instance
      ) {
        memo[name] = desc
      }
      return memo
    },
    memo,
  )
}

export function getClassChain(ctor: any): any[] {
  const proto = Object.getPrototypeOf(ctor)
  return [ctor, ...(proto ? getClassChain(proto) : [])]
}

export const Refl = (() => {
  try {
    require('reflect-metadata')
    return Reflect
  } catch {
    return {
      getMetadataKeys() { return [] },
      defineMetadata() { /* noop */ },
      getMetadata() {/* noop */ }
    }
  }
})() as typeof Reflect
