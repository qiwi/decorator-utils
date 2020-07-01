/** @module @qiwi/decorator-utils */

export interface IDecorator {
  (...args: Array<any>): any
}

export type IInstance = {
  constructor: IInstance
  prototype?: IProto
}

export type IDecoratorArgs = any[]

export type IDecoratorContext = {
  targetType: ITargetType,
  target: ITarget,
  proto: IProto,
  ctor: Function,
  propName?: IPropName
  paramIndex?: IParamIndex,
  descriptor?: IDescriptor
}

export type IDecoratorHandlerContext = IDecoratorContext & {
  args: IDecoratorArgs
}

export type IParamIndex = number

export type IHandler = (context: IDecoratorHandlerContext) => ITarget

export interface IProto {
  [key: string]: IAnyType
}
export type IMapIterator = {
  (value: IAnyType, key: any, obj: IAnyType): IAnyType
}
export type IReduceIterator = {
  (result: IAnyType, value: IAnyType, key: string, obj: IAnyType): IAnyType
}

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

export type IDescriptor = PropertyDescriptor
