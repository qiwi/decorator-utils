// @flow
import type {
  IProto,
  IInstance,
  IDescriptor,
  IAnyType,
  IReducible,
  IMapIterator,
  IReduceIterator
} from './interface'

// TODO use lodash?
export function isFunction (value: IAnyType): boolean {
  return typeof value === 'function'
}

export function isUndefined (value: IAnyType): boolean {
  return typeof value === 'undefined'
}

export function mapValues (obj: IReducible, fn: IMapIterator): Object {
  const result = {}
  let value: IAnyType

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      value = obj[key]
      result[key] = fn(value, key, obj)
    }
  }

  return result
}

export function reduce<M> (obj: IReducible, fn: IReduceIterator, memo: M): M {
  let result = memo
  let value: IAnyType

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      value = obj[key]
      result = fn(result, value, key)
    }
  }

  return result
}

/**
 * Extracts prototype methods of instance.
 * @param {*} instance
 * @returns {Object}
 */
export function getPrototypeMethods (instance: IInstance): Object {
  const proto: IProto = instance.prototype || instance.constructor.prototype
  const propNames: IReducible = Object.getOwnPropertyNames(proto)
  const memo = {}

  return reduce(propNames, (memo: Object, name: string) => {
    const desc: ?IDescriptor = Object.getOwnPropertyDescriptor(proto, name)

    if (desc && isFunction(desc.value) && desc.value !== instance.constructor && desc.value !== instance) {
      memo[name] = desc
    }
    return memo
  }, memo)
}
