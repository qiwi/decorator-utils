export interface IDecorator {
  (...args: Array<any>): any;
}

export type ITargetType = string
export type ITargetTypes = ITargetType | Array<ITargetType>
