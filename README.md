# decorator-utils

[![Build Status](https://travis-ci.com/qiwi/decorator-utils.svg?branch=master)](https://travis-ci.com/qiwi/decorator-utils)
[![Maintainability](https://api.codeclimate.com/v1/badges/4c341fd87383813f8e18/maintainability)](https://codeclimate.com/github/qiwi/decorator-utils/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4c341fd87383813f8e18/test_coverage)](https://codeclimate.com/github/qiwi/decorator-utils/test_coverage)
[![dependencyStatus](https://img.shields.io/david/qiwi/decorator-utils.svg?maxAge=3600)](https://david-dm.org/qiwi/decorator-utils)
[![CodeStyle](https://img.shields.io/badge/code%20style-tslint--config--qiwi-brightgreen.svg)](https://github.com/qiwi/tslint-config-qiwi)

## Motivation
1. — Decorator, what's that?  
   — It's just a proposal ["aspect" syntax for JS](https://github.com/tc39/proposal-decorators).
2. — How does it work?  
   — [Addy Osmany's answer](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841)
3. — Is there any ready solution?  
   — There're many awesome things around. Look at [core-decorators](https://www.npmjs.com/package/core-decorators) and [lodash-decorators](https://www.npmjs.com/package/lodash-decorators). 
4. — Do I need _this_ lib?  
   — You should try this one before: [decorator-utils](https://www.npmjs.com/package/decorator-utils) by Luke Horvat
5. — ...  
   — [Just give a chance to Google](https://google.com/search?q=js+decorator+utils)
6. — ...   
   — How about writing your own? [Netanel Basal's practical tips](https://netbasal.com/create-and-test-decorators-in-javascript-85e8d5cf879c) may be very helpful.
6. — ...  
   — *Yes*, go ahead.

##### NOTE
There's no right way to support both decorator types: with @parentheses() and @plain.
Holy War Thread: [https://github.com/wycats/javascript-decorators/issues/23](https://github.com/wycats/javascript-decorators/issues/23)


## Install
```bash
yarn add @qiwi/decorator-utils
```

## Usage
#### Method
```typescript
import {constructDecorator} from '@qiwi/decorator-utils'

const decorator = constructDecorator((targetType, target, param) => {
  if (targetType === METHOD) {
    return value => param || 'qux'
  }
})

class Foo {
  @decorator()
  foo () { return 'bar' }
  @decorator('BAZ')
  baz () { return 'baz' }
}
```

#### Class
```typescript
const decorator = constructDecorator((targetType, target) => {
  if (targetType === CLASS) {
    return class Bar extends target {
      constructor (name, age) {
        super(name)
        this.age = age
      }
    }
  }
})

@decorator()
class Foo {
  constructor (name) {
    this.name = name
  }
  foo () { return 'bar' }
}
```

#### Field & Param
```typescript
import {createDecorator, FIELD, PARAM} from '@qiwi/decorator-utils'

const meta: any = {}
const decorator = constructDecorator(({
    propName,
    paramIndex,
    targetType,
    target,
    args: [param]
}: IDecoratorHandlerContext) => {
  if (targetType === PARAM) {
    if (propName && typeof paramIndex === 'number') {
      meta[propName] = meta[propName] || {}
      meta[propName][paramIndex] = target
    }
  }

  if (targetType === FIELD) {
    if (propName) {
      meta[propName] = param
    }
  }
})

class Foo {
  @decorator('arg')
  foo = 'bar'

  bar(one: any, @decorator() two: any) {
    return 'bar'
  }
}

/**
    Now `meta` is smth like:
    {
      foo: 'arg',
      bar: {
        1: Foo.prototype.bar,
      },
    }
*/
```

You may also apply the decorator to the class, but decorate its methods:

```typescript
const decorator = constructDecorator((targetType, target) => {
      if (targetType === METHOD) {
        return () => {
          return target().toUpperCase()
        }
      }
    })

    @decorator()
    class Foo {
      foo () { return 'bar' }
      baz () { return 'baz' }
    }
```

#### IDecoratorHandlerContext
`constructDecorator` factory provides the handler access to the decorator context.
This data describes the specifics of the decorated target, decorator arguments and so on.
```typescript
export type IDecoratorHandlerContext = {
  targetType: ITargetType | null
  target: ITarget
  proto: IProto
  ctor: Function
  propName?: IPropName
  paramIndex?: IParamIndex
  descriptor?: IDescriptor
  args: IDecoratorArgs
}
```
