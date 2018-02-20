// TODO use lodash?
export function isFunction (value: any): boolean {
  return typeof value === 'function'
}

export function isUndefined (value: any): boolean {
  return typeof value === 'undefined'
}

export function mapValues (obj: Object, fn: Function): Object {
  const result = {}

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = fn(obj[key], key, obj)
    }
  }

  return result
}

export function reduce (obj, fn, memo) {
  let result = memo

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      result = fn(result, obj[key], key)
    }
  }

  return result
}

/**
 * Extracts prototype methods of instance.
 * @param {*} instance
 * @returns {Object}
 */
export function getPrototypeMethods (instance) {
  const proto = instance.prototype || instance.constructor.prototype
  const propNames = Object.getOwnPropertyNames(proto)

  return reduce(propNames, (memo, name) => {
    const desc = Object.getOwnPropertyDescriptor(proto, name)

    if (desc && isFunction(desc.value) && desc.value !== instance.constructor && desc.value !== instance) {
      memo[name] = desc
    }
    return memo
  }, {})
}
