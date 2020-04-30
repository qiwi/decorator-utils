/** @module @qiwi/decorator-utils */

import {isFunction, isUndefined, mapValues, getPrototypeMethods} from './utils'
import {
  IDecoratorArgs,
  IHandler,
  IPropName,
  IDecorator,
  ITarget,
  ITargetTypes,
  ITargetType,
  IDescriptor,
  IParamIndex,
  IProto,
} from './interface'

import {
  METHOD,
  CLASS,
  FIELD,
  PARAM,
  getTargetType,
  getDecoratorContext
} from './resolver'

export {injectMeta} from './meta'

export * from './resolver'

/**
 * Constructs decorator by given function.
 * Holywar goes here: https://github.com/wycats/javascript-decorators/issues/23
 * @param {IHandler} handler
 * @param {ITargetTypes} [allowedTypes]
 * @returns {function(...[any])}
 */
export const constructDecorator = (
  handler: IHandler,
  allowedTypes?: ITargetTypes,
): IDecorator => {
  if (!isFunction(handler)) {
    throw new Error('Decorator handler must be a function')
  }

  return (...args: IDecoratorArgs): Function => (
    target: ITarget,
    method: IPropName,
    descriptor: IDescriptor | IParamIndex,
  ): any => {

    const _handler = getSafeHandler(handler)
    const targetType = getTargetType(target, method, descriptor)
    const decoratorContext = getDecoratorContext(target, method, descriptor)

    if (!decoratorContext) {
      return
    }

    const handlerContext = {...decoratorContext, args}

    assertTargetType(targetType, allowedTypes)

    switch (targetType) {
      case PARAM:
        _handler(handlerContext)

        return

      case FIELD:
        if (!descriptor) {

          return (function(target: IProto, key: string) {
            let val = target[key]

            const getter = () => val
            const setter = (next: unknown) => {
              val = _handler({
                ...handlerContext,
                target: () => next,
              })()
            }

            Object.defineProperty(target, key, {
              get: getter,
              set: setter,
              enumerable: true,
              configurable: true,
            })

            return target
          })(target, method)
        }

        // @ts-ignore
        descriptor.initializer = _handler({targetType, target: descriptor.initializer, args})
        return

      case METHOD:
        if (typeof descriptor === 'object') {
          descriptor.value = _handler(handlerContext)
        }
        return

      case CLASS:
        Object.defineProperties(
          target.prototype,
          mapValues(
            getPrototypeMethods(target),
            (desc: IDescriptor, name: IPropName) => {
              desc.value = _handler({
                targetType: METHOD,
                target: desc.value,
                ctor: target,
                proto: target.prototype,
                args,
              })
              return desc
            },
          ),
        )

        return _handler({
          targetType: CLASS,
          target,
          ctor: target,
          proto: target.prototype,
          args,
        })

      default:
        return
    }
  }
}

export const assertTargetType = (
  targetType: ITargetType | null,
  allowedTypes: ITargetTypes | void,
): void => {
  if (allowedTypes) {
    // @ts-ignore
    const allowed: string[] = [].concat(allowedTypes)

    if (!targetType || !allowed.includes(targetType)) {
      throw new Error(`Decorator must be applied to allowed types only: ${allowed.join(', ')}`)
    }
  }
}

const getSafeHandler = (handler: IHandler): IHandler =>
  (context) => {
    const {targetType, target} = context
    const _target = handler(context)

    return ((targetType === CLASS || targetType === METHOD) && !isFunction(_target))
      ? target
      : isUndefined(_target)
        ? target
        : _target
  }

export const createDecorator = constructDecorator

export default constructDecorator
