/** @module @qiwi/decorator-utils */

import {
  IDecorator,
  IDecoratorArgs,
  IDecoratorContext,
  IDecoratorOptions,
  IUniversalDecorator,
  IDescriptor,
  IHandler,
  ITargetType,
  ITargetTypes,
} from './interface'
import { getDecoratorContext, CLASS, FIELD, METHOD, PARAM } from './resolver'
import {
  getPrototypeMethods,
  isFunction,
  mapValues,
} from './utils'

/**
 * Constructs decorator by a given function.
 * Holywar goes here: https://github.com/wycats/javascript-decorators/issues/23
 * @param {IHandler} handler
 * @param {IDecoratorOptions | ITargetTypes} [options]
 * @returns {function(...[any])}
 */
export const constructDecorator = <A extends IDecoratorArgs = IDecoratorArgs, H extends IHandler<A> = IHandler<A>>(
  handler: H,
  options?: IDecoratorOptions | ITargetTypes,
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
    const { allowedTypes } = normalizeOptions(options)

    assertTargetType(targetType, allowedTypes)

    return decorate<H>(handler, decoratorContext)
  }
}

const normalizeOptions = (options?: IDecoratorOptions | ITargetTypes): IDecoratorOptions => {
  if (options === undefined) {
    return {}
  }

  if (typeof options === 'string' || Array.isArray(options)) {
    return {
      allowedTypes: options
    }
  }

  return options
}


const decorateParam = <H extends IHandler>(handler: H, context: IDecoratorContext) => handler(context)

const decorateField = <H extends IHandler>(handler: H, context: IDecoratorContext, descriptor: IDescriptor) => {
  if (descriptor) {
    // prettier-ignore
    // @ts-ignore
    descriptor.initializer = handler({ ...context, target: descriptor.initializer })
  } else {
    handler(context)
  }
}

const decorateMethod = <H extends IHandler>(handler: H, context: IDecoratorContext, descriptor?: IDescriptor) => {
  const method = handler(context)

  if (!isFunction(method)) {
    return context.target
  }

  if (typeof descriptor === 'object') {
    descriptor.value = method
    return
  }

  return method
}

const decorateClass = <H extends IHandler>(handler: H, context: IDecoratorContext) => {
  const { target, proto } = context

  Object.defineProperties(
    proto,
    mapValues(getPrototypeMethods(target), (desc: PropertyDescriptor) => {
      desc.value = decorateMethod(handler,{
        ...context,
        descriptor: desc,
        targetType: METHOD,
        target: desc.value,
      })
      return desc
    }),
  )

  const cl = handler(context)

  if (!isFunction(cl)) {
    return target
  }

  return cl
}

const decorate = <H extends IHandler<any>>(handler: H, context: IDecoratorContext) => {
  const { targetType, descriptor } = context

  switch (targetType) {
    case PARAM: {
      return decorateParam<H>(handler, context)
    }

    case FIELD: {
      return decorateField<H>(handler, context, descriptor as IDescriptor)
    }

    case METHOD: {
      return decorateMethod<H>(handler, context, descriptor as IDescriptor)
    }

    case CLASS: {
      return decorateClass<H>(handler, context)
    }
  }
}

export const assertTargetType = (
  targetType: ITargetType,
  allowedTypes?: ITargetTypes,
): void => {
  if (allowedTypes?.length) {
    const allowed: ITargetType[] = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes]

    if (!allowed.includes(targetType)) {
      throw new Error(
        `Decorator is compatible with ${allowed
          .map((v: ITargetType) => `'${v}'`) // eslint-disable-line sonarjs/no-nested-template-literals
          .join(', ')} only, but was applied to '${targetType}'`,
      )
    }
  }
}

export const createDecorator = constructDecorator
