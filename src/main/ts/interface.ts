/** @module @qiwi/decorator-utils */

import { DecoratorContext } from '@qiwi/decorator-utils/dc'

import { ICallable } from '@qiwi/substrate'

export { ICallable } from '@qiwi/substrate'

export interface IDecorator {
  (...args: Array<any>): any
}

export type IParamIndex = number
export type IPropName = string
export type IPropValue = any
export type ITarget = any
export type ITargetType = string
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

export type IDecoratorArgs = any[]

export type IDecoratorContext = {
  targetType: ITargetType
  target: ITarget
  proto: IProto
  ctor: ICallable
  propName?: IPropName
  paramIndex?: IParamIndex
  descriptor?: IDescriptor
}

export type IDecoratorHandlerContext = IDecoratorContext & {
  args: IDecoratorArgs
}

export type IHandler = (context: IDecoratorHandlerContext) => ITarget

export type IMapIterator = {
  (value: IAnyType, key: any, obj: IAnyType): IAnyType
}
export type IReduceIterator = {
  (result: IAnyType, value: IAnyType, key: string, obj: IAnyType): IAnyType
}
