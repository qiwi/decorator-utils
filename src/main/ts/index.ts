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
  getDecoratorContext,
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
    propName: IPropName,
    descriptor: IDescriptor | IParamIndex,
  ): any => {

    const decoratorContext = getDecoratorContext(target, propName, descriptor)
    if (!decoratorContext) {
      return
    }

    const targetType = getTargetType(target, propName, descriptor)
    assertTargetType(targetType, allowedTypes)

    const handlerContext = {...decoratorContext, args}
    const _handler = getSafeHandler(handler)

    switch (targetType) {
      case PARAM:
        _handler(handlerContext)
        break

      case FIELD:
        if (!descriptor) {
          _handler(handlerContext)
        }
        else {
          // @ts-ignore
          descriptor.initializer = _handler({...handlerContext, target: descriptor.initializer})
        }
        break

      case METHOD:
        if (typeof descriptor === 'object') {
          descriptor.value = _handler(handlerContext)
        }
        break

      case CLASS:
        Object.defineProperties(
          target.prototype,
          mapValues(
            getPrototypeMethods(target),
            (desc: IDescriptor) => {
              desc.value = _handler({
                ...handlerContext,
                targetType: METHOD,
                target: desc.value,
              })
              return desc
            },
          ),
        )

        return _handler(handlerContext)
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

    if (isUndefined(_target)) {
      return target
    }

    if ((targetType === CLASS || targetType === METHOD) && !isFunction(_target)) {
      return target
    }

    return _target
  }

export const createDecorator = constructDecorator

export default constructDecorator
