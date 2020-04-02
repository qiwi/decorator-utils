/** @module @qiwi/decorator-utils */

import {
  IProto,
  IInstance,
  IDescriptor,
  IReducible,
} from './interface'

import get from 'lodash/get'
import set from 'lodash/set'
import mapValues from 'lodash/mapValues'
import reduce from 'lodash/reduce'
import isFunction from 'lodash/isFunction'
import isUndefined from 'lodash/isUndefined'

export {
  get,
  set,
  mapValues,
  isUndefined,
  isFunction,
}

/**
 * Extracts prototype methods of instance.
 * @param {*} instance
 * @returns {Object}
 */
export function getPrototypeMethods(instance: IInstance): PropertyDescriptorMap {
  // WORKAROUND: empty object fallback
  const proto: IProto = instance.prototype || instance.constructor.prototype || {}
  const propNames: IReducible = Object.getOwnPropertyNames(proto)
  const memo: PropertyDescriptorMap = {}

  return reduce(
    propNames,
    (memo: {[key: string]: any}, name: string) => {
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
