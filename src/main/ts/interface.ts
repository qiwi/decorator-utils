/** @module @qiwi/decorator-utils */


import type { ICallable } from '@qiwi/substrate'

export type { ICallable } from '@qiwi/substrate'

export type IDecoratorArgs = any[]

export interface IDecorator<A extends IDecoratorArgs = IDecoratorArgs> {
  (...args: A): ICallable
}

export interface IUniversalDecorator {
  (
    target: ITarget,
    propName: IRuntimeContext,
    descriptor?: IDescriptor | IParamIndex,
  ): any
}

export type IParamIndex = number
export type IPropName = string
export type IPropValue = any
export type ITarget = any
export type ITargetType = 'method' | 'class' | 'field' | 'param' | 'accessor' | 'getter' | 'setter' | string
export type ITargetTypes = ITargetType | Array<ITargetType>
export type IAnyType = any
export interface IReducible {
  hasOwnProperty(name: string): boolean
  [key: string]: IAnyType
}

export type IRuntimeContext = IPropName | DecoratorContext

export type IDescriptor = PropertyDescriptor

export interface IProto {
  [key: string]: IAnyType
}

export type IInstance = {
  constructor: IInstance
  prototype?: IProto
}

export type IDecoratorContext<A extends IDecoratorArgs = IDecoratorArgs> = {
  args: A
  kind: ITargetType
  targetType: ITargetType
  target: ITarget
  proto: IProto
  ctor: ICallable
  propName?: IPropName
  paramIndex?: IParamIndex
  descriptor?: IDescriptor
}

export type IHandler<A extends IDecoratorArgs = IDecoratorArgs> = (context: IDecoratorContext<A>) => ITarget

export type IMapIterator = {
  (value: IAnyType, key: any, obj: IAnyType): IAnyType
}
export type IReduceIterator = {
  (result: IAnyType, value: IAnyType, key: string, obj: IAnyType): IAnyType
}
