/** @module @qiwi/decorator-utils */

import {
  isFunction,
  isUndefined,
  mapValues,
  getPrototypeMethods,
} from './utils'

import {
  IDecoratorArgs,
  IDecoratorHandlerContext,
  IHandler,
  IPropName,
  IDecorator,
  ITarget,
  ITargetTypes,
  ITargetType,
  IDescriptor,
  IParamIndex,
} from './interface'

import {
  METHOD,
  CLASS,
  FIELD,
  PARAM,
  getDecoratorContext,
} from './resolver'

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

    const {targetType} = decoratorContext
    assertTargetType(targetType, allowedTypes)

    const handlerContext = {...decoratorContext, args}
    const _handler = getSafeHandler(handler)

    return decorate(_handler, handlerContext, descriptor)
  }
}

type IDecoratorApplier = (
  handler: IHandler,
  context: IDecoratorHandlerContext,
  descriptor: IDescriptor | IParamIndex,
) => any

const decorate: IDecoratorApplier = (handler, context, descriptor) => {
  const {targetType} = context

  switch (targetType) {
    case PARAM:
      decorateParam(handler, context, descriptor)
      break

    case FIELD:
      decorateField(handler, context, descriptor)
      break

    case METHOD:
      decorateMethod(handler, context, descriptor)
      break

    case CLASS:
      return decorateClass(handler, context, descriptor)
  }
}

const decorateClass: IDecoratorApplier = (handler, context) => {
  const {proto, target} = context

  Object.defineProperties(
    proto,
    mapValues(
      getPrototypeMethods(target),
      (desc: IDescriptor) => {
        desc.value = handler({
          ...context,
          descriptor: desc,
          targetType: METHOD,
          target: desc.value,
        })
        return desc
      },
    ),
  )

  return handler(context)
}

const decorateField: IDecoratorApplier = (handler, context, descriptor) => {
  if (!descriptor) {
    handler(context)
  }
  else {
    // @ts-ignore
    descriptor.initializer = handler({...context, target: descriptor.initializer})
  }
}

const decorateMethod: IDecoratorApplier = (handler, context, descriptor) => {
  if (typeof descriptor === 'object') {
    descriptor.value = handler(context)
  }
}

const decorateParam: IDecoratorApplier = (handler, context) => handler(context)

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
