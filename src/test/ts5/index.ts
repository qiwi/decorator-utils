import assert from 'node:assert'
import {createDecorator, METHOD, CLASS} from '@qiwi/decorator-utils'

const plus = createDecorator(
  ({ targetType, target, args: [param] }) => {
    return (value: number) => target(value) + param
  },
  METHOD,
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
    return v
  }
  declare ping: () => 'pong'
}

const f = new Foo()

assert.equal(f.bar(1), 4)
assert.equal(f.ping(), 'pong')
