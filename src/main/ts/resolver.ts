/** @module @qiwi/decorator-utils */

import {
  IDecoratorContext,
  IDescriptor,
  IParamIndex,
  IPropName,
  ITarget,
  ITargetType,
} from './interface'
import {isFunction} from './utils'

export const METHOD = 'method'
export const CLASS = 'class'
export const FIELD = 'field'
export const PARAM = 'param'
export const TARGET_TYPES = {METHOD, CLASS, FIELD, PARAM}

export const getDecoratorContext = (
  target: ITarget,
  propName: IPropName,
  descriptor: IDescriptor | IParamIndex,
): IDecoratorContext | null => {

  const targetType = getTargetType(target, propName, descriptor)

  switch (targetType) {
    case PARAM:
      if (typeof descriptor === 'number') {
        return {
          target: target[propName],
          targetType,
          ctor: target.constructor,
          proto: target,
          propName,
          paramIndex: descriptor,
        }
      }
      break

    case FIELD:
      return {
        targetType,
        ctor: target.constructor,
        proto: target,
        propName,
        target: descriptor
          // @ts-ignore
          ? descriptor.initializer
          : target,
      }

    case METHOD:
      if (typeof descriptor === 'object') {
        return {
          targetType,
          target: descriptor.value,
          ctor: target.constructor,
          proto: target,
          propName,
        }
      }
      break

    case CLASS:
      return {
        targetType: CLASS,
        target,
        ctor: target,
        proto: target.prototype,
      }
  }

  return null
}

/**
 * Detects decorated target type.
 * @param {*} target
 * @param {string} [method]
 * @param {Object} [descriptor]
 * @returns {*}
 */
export const getTargetType = (
  target: ITarget,
  method: IPropName | symbol,
  descriptor: IDescriptor | IParamIndex | void,
): ITargetType | null => {

  if (typeof descriptor === 'number') {
    return PARAM
  }

  if (method) {
    return descriptor && isFunction(descriptor.value)
      ? METHOD
      : FIELD
  }

  if (isFunction(target)) {
    return CLASS
  }

  return null
}
