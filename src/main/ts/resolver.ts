/** @module @qiwi/decorator-utils */

import {
  IDecoratorContext,
  IDescriptor,
  IParamIndex,
  IPropName,
  ITarget,
  ITargetType
} from './interface'
import {isFunction} from './utils'

export const METHOD = 'method'
export const CLASS = 'class'
export const FIELD = 'field'
export const PARAM = 'param'
export const TARGET_TYPES = {METHOD, CLASS, FIELD, PARAM}

export const getDecoratorContext = (
  target: ITarget,
  method: IPropName,
  descriptor: IDescriptor | IParamIndex,
): IDecoratorContext | null => {

  const targetType = getTargetType(target, method, descriptor)

  switch (targetType) {
    case PARAM:
      if (typeof descriptor === 'number') {
        return {
          target: target[method],
          targetType,
          ctor: target.constructor,
          proto: target,
          propName: method,
          paramIndex: descriptor,
        }
      }

    case FIELD:
      if (!descriptor) {

        return {
          targetType,
          target,
          ctor: target.constructor,
          proto: target,
          propName: method,
        }

      }

      // @ts-ignore
      return { targetType, target: descriptor.initializer }

    case METHOD:
      if (typeof descriptor === 'object') {
        return {
          targetType,
          target: descriptor.value,
          ctor: target.constructor,
          proto: target,
          propName: method,
        }
      }


    case CLASS:
      return {
        targetType: CLASS,
        target,
        ctor: target,
        proto: target.prototype,
      }

    default:
      return null
  }
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
