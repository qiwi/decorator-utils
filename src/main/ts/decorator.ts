/** @module @qiwi/decorator-utils */

import {
  IDecorator,
  IDecoratorArgs,
  IDecoratorContext,
  IUniversalDecorator,
  IDescriptor,
  IHandler,
  IParamIndex,
  ITargetType,
  ITargetTypes,
} from './interface'
import { getDecoratorContext, CLASS, FIELD, METHOD, PARAM } from './resolver'
import {
  getPrototypeMethods,
  isFunction,
  isUndefined,
  mapValues,
} from './utils'

/**
 * Constructs decorator by a given function.
 * Holywar goes here: https://github.com/wycats/javascript-decorators/issues/23
 * @param {IHandler} handler
 * @param {ITargetTypes} [allowedTypes]
 * @returns {function(...[any])}
 */
export const constructDecorator = <A extends IDecoratorArgs = IDecoratorArgs>(
  handler: IHandler<A>,
  allowedTypes?: ITargetTypes,
): IDecorator<A> => {
  if (!isFunction(handler)) {
    throw new Error('Decorator handler must be a function')
  }

  return (...args: A): IUniversalDecorator => (
    target,
    propName,
    descriptor,
  ): any => {
    const decoratorContext = getDecoratorContext<A>(args, target, propName, descriptor)
    if (!decoratorContext) {
      return
    }

    const { targetType } = decoratorContext
    assertTargetType(targetType, allowedTypes)

    const _handler = getSafeHandler(handler as IHandler)

    return decorate(_handler, decoratorContext, descriptor)
  }
}

type IDecoratorApplier = (
  handler: IHandler,
  context: IDecoratorContext,
  descriptor?: IDescriptor | IParamIndex,
) => any

const decorateParam: IDecoratorApplier = (handler, context) => handler(context)

const decorateField: IDecoratorApplier = (handler, context, descriptor) => {
  if (descriptor) {
    // prettier-ignore
    // @ts-ignore
    descriptor.initializer = handler({ ...context, target: descriptor.initializer })
  } else {
    handler(context)
  }
}

const decorateMethod: IDecoratorApplier = (handler, context, descriptor) => {
  const _handler = handler(context)
  if (typeof descriptor === 'object') {
    descriptor.value = _handler
    return
  }

  return _handler
}

const decorateClass: IDecoratorApplier = (handler, context) => {
  const { target, proto } = context

  Object.defineProperties(
    proto,
    mapValues(getPrototypeMethods(target), (desc: IDescriptor) => {
      desc.value = handler({
        ...context,
        descriptor: desc,
        targetType: METHOD,
        target: desc.value,
      })
      return desc
    }),
  )

  return handler(context)
}

const decorate: IDecoratorApplier = (handler, context, descriptor) => {
  const { targetType } = context

  switch (targetType) {
    case PARAM: {
      return decorateParam(handler, context)
    }

    case FIELD: {
      return decorateField(handler, context, descriptor)
    }

    case METHOD: {
      return decorateMethod(handler, context, descriptor)
    }

    case CLASS: {
      return decorateClass(handler, context)
    }
  }
}

export const assertTargetType = (
  targetType: ITargetType,
  allowedTypes?: ITargetTypes,
): void => {
  if (allowedTypes?.length) {
    // @ts-ignore
    const allowed: ITargetType[] = [].concat(allowedTypes) // eslint-disable-line

    if (!allowed.includes(targetType)) {
      throw new Error(
        `Decorator is compatible with ${allowed
          .map((v: ITargetType) => `'${v}'`) // eslint-disable-line sonarjs/no-nested-template-literals
          .join(', ')} only, but was applied to '${targetType}'`,
      )
    }
  }
}

const getSafeHandler = (handler: IHandler): IHandler => (context) => {
  const { targetType, target } = context
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
