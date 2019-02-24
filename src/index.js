// @flow

import { isFunction, isUndefined, mapValues, getPrototypeMethods } from './utils'
import type {
  IDecoratorArgs,
  IHandler,
  IPropName,
  IPropValue,
  IDecorator,
  ITarget,
  ITargetTypes,
  ITargetType,
  IDescriptor
} from './interface'

export const METHOD = 'method'
export const CLASS = 'class'
export const FIELD = 'field'
export const TARGET_TYPES = { METHOD, CLASS, FIELD }

/**
 * Constructs decorator by given function.
 * Holywar goes here: https://github.com/wycats/javascript-decorators/issues/23
 * @param {Function} handler
 * @param {ITargetTypes} [allowedTypes]
 * @returns {function(...[any])}
 */
export function constructDecorator (handler: IHandler, allowedTypes: ?ITargetTypes): IDecorator {
  if (!isFunction(handler)) {
    throw new Error('Decorator handler must be a function')
  }

  return (...args: IDecoratorArgs): Function => (target: ITarget, method: ?IPropName, descriptor: IDescriptor): any => {
    const targetType = getTargetType(target, method, descriptor)
    assertTargetType(targetType, allowedTypes)

    const _handler = getHandler(handler, ...args)

    switch (targetType) {
      case FIELD:
        // $FlowFixMe
        descriptor.initializer = _handler(targetType, descriptor.initializer)
        return

      case METHOD:
        // $FlowFixMe
        descriptor.value = _handler(targetType, descriptor.value)
        return

      case CLASS:
        Object.defineProperties(target.prototype, mapValues(getPrototypeMethods(target), (desc: IDescriptor, name: IPropName) => {
          desc.value = _handler(METHOD, desc.value)
          return desc
        }))

        return _handler(CLASS, target)

      default:
        return
    }
  }
}

export const getHandler = (handler: IHandler, ...args: IDecoratorArgs): IHandler => {
  return (targetType, value: IPropValue): IPropValue => {
    const _value: IPropValue = handler(targetType, value, ...args)
    return isUndefined(_value) ? value : _value
  }
}

/**
 * Detects decorated target type.
 * @param {*} target
 * @param {string} [method]
 * @param {Object} [descriptor]
 * @returns {*}
 */
export const getTargetType = (target: ITarget, method: ?IPropName, descriptor: ?IDescriptor): ?ITargetType => {
  if (method && descriptor) {
    return isFunction(descriptor.value) ? METHOD : FIELD
  }

  return isFunction(target) ? CLASS : null
}

export const assertTargetType = (targetType?: ?ITargetType, allowedTypes?: ?ITargetTypes): void => {
  if (allowedTypes) {
    const allowed: string[] = [].concat(allowedTypes)
    if (!allowed.includes(targetType)) {
      throw new Error(`Decorator must be applied to allowed types only: ${allowed.join(', ')}`)
    }
  }
}

export default constructDecorator
