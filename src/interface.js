// @flow

export interface IDecorator {
  (...args: Array<any>): any;
}

export type IInstance = {
  constructor: IInstance;
  prototype: IProto;
}

export type IDecoratorArgs = any

export type IHandler = {
  (targetType: ?ITargetType, value: IPropValue, ...args: IDecoratorArgs): IPropValue
}
export interface IProto {
  [key: string]: IAnyType
}
export type IMapIterator = {
  (value: IAnyType, key: any, obj: IAnyType): IAnyType
}
export type IReduceIterator = {
  (result: IAnyType, value: IAnyType, key: any): IAnyType
}

export type IPropName = string
export type IPropValue = any
export type ITarget = any
export type ITargetType = string
export type ITargetTypes = ITargetType | Array<ITargetType>
export type IAnyType = any
export interface IReducible {
  hasOwnProperty(name: string): boolean;
  [key: any]: IAnyType
}

export type IDescriptor = PropertyDescriptor<IAnyType>
