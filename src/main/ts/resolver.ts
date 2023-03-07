/** @module @qiwi/decorator-utils */

import {
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

type IResolver = {
  (
    target: ITarget,
    propName: IRuntimeContext,
    descriptor: IDescriptor | IParamIndex | void,
  ): IDecoratorContext | null
}

export const getDecoratorContext: IResolver = (...args) =>
  getModernDecoratorsContext(...args) ||
  getParamDecoratorContext(...args) ||
  getMethodDecoratorContext(...args) ||
  getFieldDecoratorContext(...args) ||
  getClassDecoratorContext(...args)

// https://github.com/tc39/proposal-decorators
export const getModernDecoratorsContext: IResolver = (target: ITarget, ctx: IRuntimeContext) => {
  if (typeof ctx !== 'object') {
    return null
  }
  const { kind } = ctx
  const ctor = kind === CLASS ? target : null

  return {
    kind,
    targetType: kind,
    target,
    ctor,
    proto: ctor?.prototype
  }
}

export const getClassDecoratorContext: IResolver = (target) =>
  isFunction(target)
    ? {
        kind: CLASS,
        targetType: CLASS,
        target,
        ctor: target,
        proto: target.prototype,
      }
    : null

export const getMethodDecoratorContext: IResolver = (
  target,
  propName,
  descriptor,
) =>
  typeof propName === 'string' && typeof descriptor === 'object' && isFunction(descriptor.value)
    ? {
        kind: METHOD,
        targetType: METHOD,
        target: descriptor.value,
        ctor: target.constructor,
        proto: target,
        propName,
        descriptor,
      }
    : null

export const getParamDecoratorContext: IResolver = (
  target,
  propName,
  descriptor,
) =>
  typeof propName === 'string' && typeof descriptor === 'number'
    ? {
        kind: PARAM,
        targetType: PARAM,
        target: target[propName],
        ctor: target.constructor,
        proto: target,
        propName,
        paramIndex: descriptor,
      }
    : null

export const getFieldDecoratorContext: IResolver = (
  target,
  propName,
  descriptor,
) =>
  typeof propName === 'string'
    ? {
        kind: FIELD,
        targetType: FIELD,
        ctor: target.constructor,
        proto: target,
        propName,
        target: descriptor
          ? // @ts-ignore
            descriptor.initializer
          : target,
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
  descriptor: IDescriptor | IParamIndex | void,
): ITargetType | null =>
  getDecoratorContext(target, propName, descriptor)?.targetType || null
