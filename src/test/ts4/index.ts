import assert from 'node:assert'
import {createDecorator, METHOD} from '@qiwi/decorator-utils'

const plus = createDecorator(
  ({ targetType, target, args: [param] }) => {
    return (value: number) => target(value) + param
  },
  {
    allowedTypes: METHOD,
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

const f = new Foo()

assert.equal(f.bar(1), 4)
