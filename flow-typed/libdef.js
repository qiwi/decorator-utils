// @flow

declare module '@qiwi/decorator-utils' {
  declare type IAnyType = any

  declare interface IDecorator {
    (...args: Array<any>): any;
  }

  declare type IDecoratorArgs = any

  declare type IHandler = {
    (targetType: ?ITargetType, value: IPropValue, ...args: IDecoratorArgs): IPropValue
  }
  declare interface IProto {
    [key: string]: IAnyType
  }

  declare type IPropName = string
  declare type IPropValue = any
  declare type ITarget = any
  declare type ITargetType = string
  declare type ITargetTypes = ITargetType | Array<ITargetType>
  declare interface IReducible {
    hasOwnProperty(name: string): boolean;
    [key: any]: IAnyType
  }

  declare type IDescriptor = PropertyDescriptor<IAnyType>
  
  declare module.exports: {
    (handler: IHandler, allowedTypes: ?ITargetTypes): IDecorator,
    constructDecorator: (handler: IHandler, allowedTypes: ?ITargetTypes) => IDecorator,
    getTargetType: (target: ITarget, method: ?IPropName, descriptor: ?IDescriptor) => ?ITargetType,
    assertTargetType: (targetType?: ?ITargetType, allowedTypes?: ?ITargetTypes) => void,

    METHOD: string,
    FIELD: string,
    CLASS: string,
    TARGET_TYPES: {
      [key: string]: string
    }
  }
}