/** @module @qiwi/decorator-utils */

import {
  ICallable,
  IDecorator,
  IDecoratorArgs,
  IDecoratorContext,
  IDecoratorOptions,
  IUniversalDecorator,
  IDescriptor,
  IHandler,
  ITargetType,
  ITargetTypes,
  IPropName,
} from './interface'
import {getDecoratorContext, CLASS, FIELD, METHOD, PARAM} from './resolver'
import {
  getClassChain,
  getPrototypeMethods,
  isFunction,
  once,
} from './utils'
import {getRefStore, getRef, setRef, TRefStore} from './meta'

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

  const udf = (...args: A): IUniversalDecorator => (
    target,
    propName,
    descriptor,
  ): any => {

    const cb = (self?: any) => {
      const decoratorContext = getDecoratorContext<A>(args, target, propName, descriptor, self)
      if (!decoratorContext) {
        return
      }

      const store = getRefStore(udf)
      checkConditions(decoratorContext, store, options)
      return decorate<H>(decoratorContext, store, handler)
    }

    return typeof propName === 'object' && propName.kind === METHOD
      ? propName.addInitializer(once(function(this: any) {
        this.constructor.prototype[propName.name] = cb(this)
      }))
      : cb()
  }

  return udf
}

const normalizeOptions = (options: IDecoratorOptions | ITargetTypes = {}): IDecoratorOptions => {
  if (typeof options === 'string' || Array.isArray(options)) {
    return {
      allowedTypes: options
    }
  }

  return options
}

const checkConditions = (decoratorContext: IDecoratorContext, store: TRefStore, options?: IDecoratorOptions | ITargetTypes): void => {
  const {targetType, ctor, propName} = decoratorContext
  const {allowedTypes, repeatable} = normalizeOptions(options)

  assertRepeatable(targetType, ctor, store, propName, repeatable)
  assertTargetType(targetType, allowedTypes)
}

const assertRepeatable = (targetType: ITargetType, ctor: ICallable, store: TRefStore, propName: IPropName = '', repeatable?: boolean): void => {
  if (repeatable) {
    return
  }

  const chain = getClassChain(ctor)
  const refs = getRef(targetType, store, propName)

  if (chain.some((v: ICallable) => refs.has(v))) {
    throw new Error(`Decorator is not repeatable for '${targetType}'`)
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

const decorate = <H extends IHandler<any>>(context: IDecoratorContext, store: TRefStore, handler: H) => {
  const {targetType, descriptor, ctor, propName} = context

  switch (targetType) {
    case PARAM: {
      return decorateParam<H>(handler, context)
    }

    case FIELD: {
      return decorateField<H>(handler, context, descriptor as IDescriptor)
    }

    case METHOD: {
      setRef(METHOD, store, ctor, propName)
      return decorateMethod<H>(handler, context, descriptor as IDescriptor)
    }

    case CLASS: {
      setRef(CLASS, store, ctor)
      return decorateClass<H>(handler, context)
    }
  }
}

const decorateParam = <H extends IHandler>(handler: H, context: IDecoratorContext) => handler(context)

const decorateField = <H extends IHandler>(handler: H, context: IDecoratorContext, descriptor: IDescriptor) => {
  if (descriptor) {
    // prettier-ignore
    // @ts-ignore
    descriptor.initializer = handler({...context, target: descriptor.initializer})
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
  const {target, proto} = context

  Object.defineProperties(
    proto,
    Object.entries(getPrototypeMethods(target)).reduce<PropertyDescriptorMap>((acc, [name, desc]) => {
      desc.value = decorateMethod(handler, {
        ...context,
        descriptor: desc,
        name,
        propName: name,
        kind: METHOD,
        targetType: METHOD,
        target: desc.value,
      })
      acc[name] = desc
      return acc
    }, {})
  )

  const cl = handler(context)
  if (!isFunction(cl)) {
    return target
  }

  return cl
}

export const createDecorator = constructDecorator
