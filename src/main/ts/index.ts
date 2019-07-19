import {isFunction, isUndefined, mapValues, getPrototypeMethods} from './utils'
import {
  IDecoratorArgs,
  IHandler,
  IPropName,
  IPropValue,
  IDecorator,
  ITarget,
  ITargetTypes,
  ITargetType,
  IDescriptor,
} from './interface'

export const METHOD = 'method'
export const CLASS = 'class'
export const FIELD = 'field'
export const TARGET_TYPES = {METHOD, CLASS, FIELD}

/**
 * Constructs decorator by given function.
 * Holywar goes here: https://github.com/wycats/javascript-decorators/issues/23
 * @param {Function} handler
 * @param {ITargetTypes} [allowedTypes]
 * @returns {function(...[any])}
 */
export function constructDecorator(
  handler: IHandler,
  allowedTypes?: ITargetTypes,
): IDecorator {
  if (!isFunction(handler)) {
    throw new Error('Decorator handler must be a function')
  }

  return (...args: IDecoratorArgs): Function => (
    target: ITarget,
    method: IPropName,
    descriptor: IDescriptor,
  ): any => {
    const _handler = getHandler(handler, ...args)
    const targetType = getTargetType(target, method, descriptor)

    assertTargetType(targetType, allowedTypes)

    switch (targetType) {
      case FIELD:
        if (!descriptor) {
          return (function(target: {[key: string]: any}, key: string) {
            let val = target[key]

            const getter = () => {
              return val
            }

            const setter = (next: unknown) => {
              val = _handler(targetType, () => next, next)()
            }

            Object.defineProperty(target, key, {
              get: getter,
              set: setter,
              enumerable: true,
              configurable: true,
            })
          })(target, method)
        }

        // @ts-ignore
        descriptor.initializer = _handler(targetType, descriptor.initializer)
        return

      case METHOD:
        descriptor.value = _handler(targetType, descriptor.value)
        return

      case CLASS:
        Object.defineProperties(
          target.prototype,
          mapValues(
            getPrototypeMethods(target),
            (desc: IDescriptor, name: IPropName) => {
              desc.value = _handler(METHOD, desc.value)
              return desc
            },
          ),
        )

        return _handler(CLASS, target, ...args)

      default:
        return
    }
  }
}

export const getHandler = (
  handler: IHandler,
  ...args: IDecoratorArgs
): IHandler => {
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
export const getTargetType = (
  target: ITarget,
  method: IPropName | symbol,
  descriptor: IDescriptor | void,
): ITargetType | null => {
  if (method && descriptor) {
    return isFunction(descriptor.value) ? METHOD : FIELD
  }

  if (isFunction(target)) {
    return CLASS
  }

  if (method && !descriptor) {
    return FIELD
  }

  return null
}

export const assertTargetType = (
  targetType: ITargetType | null,
  allowedTypes: ITargetTypes | void,
): void => {
  if (allowedTypes) {
    // @ts-ignore
    const allowed: string[] = [].concat(allowedTypes)
    if (!targetType || !allowed.includes(targetType)) {
      throw new Error(
        `Decorator must be applied to allowed types only: ${allowed.join(', ')}`,
      )
    }
  }
}

export default constructDecorator
