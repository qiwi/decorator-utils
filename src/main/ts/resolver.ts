/** @module @qiwi/decorator-utils */

import type {
  IDecoratorArgs,
  IDecoratorContext,
  IDescriptor,
  IParamIndex,
  IPropName,
  IRuntimeContext,
  ITarget,
  ITargetType,
} from './interface'
import { isFunction } from './utils'

export const METHOD = 'method'
export const CLASS = 'class'
export const FIELD = 'field'
export const PARAM = 'param'
export const ACCESSOR = 'accessor'
export const GETTER = 'getter'
export const SETTER = 'setter'
export const TARGET_TYPES = { METHOD, CLASS, FIELD, PARAM, ACCESSOR, GETTER, SETTER }

export const getDecoratorContext = <A extends IDecoratorArgs = IDecoratorArgs>(
  args: A,
  target: ITarget,
  propName: IRuntimeContext,
  descriptor?: IDescriptor | IParamIndex,
  self?: any,
): IDecoratorContext<A> | null => {
  return getModernDecoratorsContext<A>(args, target, propName, self) ||
    getLegacyDecoratorContext<A>(args, target, propName, descriptor)
}

export const getLegacyDecoratorContext = <A extends IDecoratorArgs = IDecoratorArgs>(
  args: A,
  target: ITarget,
  propName: IRuntimeContext,
  descriptor?: IDescriptor | IParamIndex,
): IDecoratorContext<A> | null =>
  getParamDecoratorContext<A>(args, target, propName, descriptor as IParamIndex) ||
  getMethodDecoratorContext<A>(args, target, propName, descriptor as IDescriptor) ||
  getFieldDecoratorContext<A>(args, target, propName, descriptor as IDescriptor) ||
  getClassDecoratorContext<A>(args, target)

export const getModernDecoratorsContext = <A extends IDecoratorArgs>(args: A, target: ITarget, ctx: IRuntimeContext, self: any) => {
  if (typeof ctx !== 'object') {
    return null
  }

  const { kind, name } = ctx
  const ctor = kind === CLASS ? target : self?.constructor
  const proto = ctor.prototype || {}
  const _target = kind === CLASS ? target : proto[name] || target

  return {
    args,
    kind,
    name,
    targetType: kind,
    target: _target,
    propName: name as string,
    ctor,
    proto
  }
}

export const getClassDecoratorContext = <A extends IDecoratorArgs>(args: A, target: ITarget) =>
  isFunction(target)
    ? {
      args,
      kind: CLASS,
      targetType: CLASS,
      target,
      ctor: target,
      proto: target.prototype,
    }
    : null

export const getMethodDecoratorContext = <A>(
  args: A,
  target: ITarget,
  propName: IRuntimeContext,
  descriptor?: IDescriptor,
) =>
  typeof propName === 'string' && typeof descriptor === 'object' && isFunction(descriptor.value)
    ? {
      args,
      kind: METHOD,
      name: propName,
      targetType: METHOD,
      target: descriptor.value,
      ctor: target.constructor,
      proto: target,
      propName,
      descriptor,
    }
    : null

export const getParamDecoratorContext = <A extends IDecoratorArgs>(
  args: A,
  target: ITarget,
  propName: IRuntimeContext,
  descriptor?: IParamIndex,
) =>
  typeof propName === 'string' && typeof descriptor === 'number'
    ? {
      args,
      name: propName,
      kind: PARAM,
      targetType: PARAM,
      target: target[propName],
      ctor: target.constructor,
      proto: target,
      propName,
      paramIndex: descriptor,
    }
    : null

export const getFieldDecoratorContext = <A extends IDecoratorArgs>(
  args: A,
  target: ITarget,
  propName: IRuntimeContext,
  descriptor?: IDescriptor,
) =>
  typeof propName === 'string'
    ? {
      args,
      name: propName,
      kind: FIELD,
      targetType: FIELD,
      ctor: target.constructor,
      proto: target,
      propName,
      descriptor,
      target: descriptor?.initializer || target
    }
    : null

/**
 * Detects decorated target type.
 * @param {*} target
 * @param {string} [propName]
 * @param {Object} [descriptor]
 * @returns {*}
 */
export const getTargetType = (
  target: ITarget,
  propName: IPropName,
  descriptor: IDescriptor | IParamIndex,
): ITargetType | null =>
  getDecoratorContext([], target, propName, descriptor)?.targetType || null
