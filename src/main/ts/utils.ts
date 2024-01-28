/** @module @qiwi/decorator-utils */

import reduce from 'lodash/reduce.js'
import type {} from 'reflect-metadata'

import { IDescriptor, IInstance, IProto, IReducible } from './interface'

export {default as get} from 'lodash/get.js'
export {default as set} from 'lodash/set.js'
export {default as once} from 'lodash/once.js'

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

// Proxy is slow, so we use this wrapper
export const Refl: Pick<typeof Reflect, 'getMetadataKeys' | 'defineMetadata' | 'getMetadata'> = ({
    getMetadataKeys(target: any) {
      return Reflect?.getMetadataKeys?.(target) || []
    },
    defineMetadata(metadataKey: any, metadataValue: any, target: any) {
      return Reflect?.defineMetadata?.(metadataKey, metadataValue, target)
    },
    getMetadata(metadataKey: any, target: any) {
      return Reflect?.getMetadata?.(metadataKey, target)
    }
  })
