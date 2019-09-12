/**
 * Flowtype definitions for index
 * Generated by Flowgen from a Typescript Definition
 * Flowgen v1.10.0
 */

declare module "@qiwi/decorator-utils/target/es5/interface" {
  /**
   * @module
   * @qiwi /decorator-utils
   */
  declare export interface IDecorator {
    (...args: Array<any>): any;
  }
  declare export type IInstance = {
    constructor: IInstance,
    prototype?: IProto,
    ...
  };
  declare export type IDecoratorArgs = any[];
  declare export type IHandler = {
    (
      targetType: ITargetType | null,
      value: IPropValue,
      ...args: IDecoratorArgs
    ): IPropValue,
    ...
  };
  declare export interface IProto {
    [key: string]: IAnyType;
  }
  declare export type IMapIterator = {
    (value: IAnyType, key: any, obj: IAnyType): IAnyType,
    ...
  };
  declare export type IReduceIterator = {
    (result: IAnyType, value: IAnyType, key: string, obj: IAnyType): IAnyType,
    ...
  };
  declare export type IPropName = string;
  declare export type IPropValue = any;
  declare export type ITarget = any;
  declare export type ITargetType = string | null;
  declare export type ITargetTypes = ITargetType | Array<ITargetType>;
  declare export type IAnyType = any;
  declare export interface IReducible {
    hasOwnProperty(name: string): boolean;
    [key: string]: IAnyType;
  }
  declare export type IDescriptor = PropertyDescriptor;
}

declare module "@qiwi/decorator-utils/target/es5/utils" {
  import type {
    IInstance,
    IAnyType,
    IReducible,
    IMapIterator,
    IReduceIterator
  } from "@qiwi/decorator-utils/target/es5/interface";

  declare export function isFunction(value: IAnyType): boolean;

  declare export function isUndefined(value: IAnyType): boolean;

  /**
   * @param {Object} obj
   * @param {Function} fn
   * @return {Object}
   */
  declare export function mapValues(obj: IReducible, fn: IMapIterator): any;

  /**
   * @param {Object} obj
   * @param {Function} fn
   * @param {Object} memo
   * @returns {Object}
   */
  declare export function reduce<M>(
    obj: IReducible,
    fn: IReduceIterator,
    memo: M
  ): M;

  /**
   * Extracts prototype methods of instance.
   * @param {*} instance
   * @returns {Object}
   */
  declare export function getPrototypeMethods(instance: IInstance): any;
}

declare module "@qiwi/decorator-utils/target/es5/index" {
  import type {
    IHandler,
    IDecorator,
    ITargetType
  } from "@qiwi/decorator-utils/target/es5/interface";

  declare export var METHOD: any; // "method"
  declare export var CLASS: any; // "class"
  declare export var FIELD: any; // "field"
  declare export var TARGET_TYPES: {
    METHOD: string,
    CLASS: string,
    FIELD: string,
    ...
  };

  /**
   * Constructs decorator by given function.
   * Holywar goes here: https://github.com/wycats/javascript-decorators/issues/23
   * @param {Function} handler
   * @param {ITargetTypes} [allowedTypes]
   * @returns {function(...[any])}
   */
  declare export var constructDecorator: (
    handler: IHandler,
    allowedTypes?: string | ITargetType[] | null | void
  ) => IDecorator;
  declare export var getHandler: (
    handler: IHandler,
    ...args: any[]
  ) => IHandler;

  /**
   * Detects decorated target type.
   * @param {*} target
   * @param {string} [method]
   * @param {Object} [descriptor]
   * @returns {*}
   */
  declare export var getTargetType: (
    target: any,
    method: string | Symbol,
    descriptor: void | PropertyDescriptor
  ) => ITargetType;
  declare export var assertTargetType: (
    targetType: ITargetType,
    allowedTypes: string | void | ITargetType[] | null
  ) => void;
  declare export var createDecorator: (
    handler: IHandler,
    allowedTypes?: string | ITargetType[] | null | void
  ) => IDecorator;
  declare export default typeof constructDecorator;
}

declare module "@qiwi/decorator-utils" {
  declare export * from "@qiwi/decorator-utils/target/es5/index"
}