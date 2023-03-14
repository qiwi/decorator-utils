# decorator-utils

[![Maintainability](https://api.codeclimate.com/v1/badges/4c341fd87383813f8e18/maintainability)](https://codeclimate.com/github/qiwi/decorator-utils/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4c341fd87383813f8e18/test_coverage)](https://codeclimate.com/github/qiwi/decorator-utils/test_coverage)

Universal decorator factories made from scratch

## Install
```bash
yarn add @qiwi/decorator-utils
```

## Notes
* There's no right way to support both decorator types: with `@parentheses()` and `@plain`.
Holy War thread: [wycats/javascript-decorators/issues/23](https://github.com/wycats/javascript-decorators/issues/23)
* TypeScript 5 decorators: [announcing-typescript-5-0](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0-beta/#decorators), [TS/issues/52435](https://github.com/microsoft/TypeScript/issues/52435), [nestjs/issues/10959](https://github.com/nestjs/nest/issues/10959)
* TC39 stage-3 [proposal decorators](https://github.com/tc39/proposal-decorators)

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

#### Context
`constructDecorator` factory provides the handler access to the decorator context.
This data describes the specifics of the decorated target, decorator arguments and so on.
```typescript
type IDecoratorHandlerContext = {
  kind: ITargetType | null // targetType alias
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

#### Options
You may set additional options to apply some decorator asserts: allowed target types, repeatable or not.

```ts
const plus = constructDecorator(
  ({ targetType, target, args: [param] }) => {
    return (value: number) => target(value) + param
  },
  {
    allowedTypes: METHOD, // string | string[]
    repeatable: true,
  },
)

class Foo {
  @plus(2)
  @plus(1)
  bar(v: number) {
    return v
  }
}
```

### Refs
* [JS decorators by Axel Rauschmayer](https://2ality.com/2022/10/javascript-decorators.html)
* ["aspect" syntax for JS](https://github.com/tc39/proposal-decorators)
* [Exploring es7 decorators by Addy Osmany](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841)
* [core-decorators](https://www.npmjs.com/package/core-decorators)
* [lodash-decorators](https://www.npmjs.com/package/lodash-decorators)
* [decorator-utils](https://www.npmjs.com/package/decorator-utils)
* [Netanel Basal's decorator tips](https://netbasal.com/create-and-test-decorators-in-javascript-85e8d5cf879c)

## License
[MIT](./LICENSE)
