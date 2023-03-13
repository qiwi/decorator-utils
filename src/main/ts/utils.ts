/** @module @qiwi/decorator-utils */

import isFunction from 'lodash.isfunction'

import reduce from 'lodash.reduce'

import { IDescriptor, IInstance, IProto, IReducible } from './interface'

export {default as get} from 'lodash.get'
export {default as isUndefined} from 'lodash.isundefined'
export {default as mapValues} from 'lodash.mapvalues'
export {default as set} from 'lodash.set'
export {default as isFunction} from 'lodash.isfunction'

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
