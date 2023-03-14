import assert from 'node:assert'
import {createDecorator, METHOD, CLASS} from '@qiwi/decorator-utils'

const plus = createDecorator(
  function ({ targetType, target, args: [param] }) {
    return function (this: any, value: number) {
      return target.call(this, value) + param
    }
  },
  {
    allowedTypes: METHOD,
    repeatable: true,
  },
)

const withPing = createDecorator(({targetType, target}) => {
  if (targetType === CLASS) {
    return class extends target {
      ping() {
        return 'pong'
      }
    }
  }
})

@withPing()
class Foo {
  @plus(2)
  @plus(1)
  bar(v: number) {
    return this.one() + v
  }
  one() {
    return 1
  }
  declare ping: () => 'pong'
}

class Bar extends Foo {}

const f = new Foo()
const b = new Bar()

assert.equal(f.bar(1), 5)
assert.equal(f.bar(1), 5)
assert.equal(b.bar(2), 6)
assert.equal(b.bar(2), 6)
assert.equal(f.ping(), 'pong')
