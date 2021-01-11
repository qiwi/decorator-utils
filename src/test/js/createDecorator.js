import {
  CLASS,
  constructDecorator,
  FIELD,
  getTargetType,
  METHOD,
} from '../../../target/bundle/decorator-utils'

const noop = () => { /* noop */ }

describe('decoratorUtils babel', () => {
  describe('#getTargetType', () => {
    const cases = [
      ['function', [noop], CLASS],
      ['class', [class Foo {}], CLASS],
      ['obj-str-{value: fn}', [{}, 'str', {value: noop}], METHOD],
      ['obj-str-obj', [{}, 'str', {}], FIELD],
      ['obj-str-null', [{}, 'str', {}], FIELD],
      ['null', [null], null],
    ]

    cases.forEach(([title, args, expected]) => {
      it(`detects ${title} as ${expected}`, () => {
        expect(getTargetType.apply(null, args)).toEqual(expected)
      })
    })
  })

  describe('#constructDecorator', () => {
    it('returns fn', () => {
      const decorator = constructDecorator(noop)
      expect(typeof decorator).toBe('function')
    })

    it('throws error if handler is not a func', () => {
      expect(() => {
        constructDecorator({})
      }).toThrow('Decorator handler must be a function')
    })
  })

  describe('decorator', () => {
    describe('for constructor', () => {
      it('extends target class', () => {
        const decorator = constructDecorator(({targetType, target}) => {
          if (targetType === CLASS) {
            return class Bar extends target {
              constructor(name, age) {
                super(name)
                this.age = age
              }
            }
          }
        })

        @decorator()
        class Foo {

          constructor(name) {
            this.name = name
          }

          foo() {
            return 'bar'
          }

        }

        const foo = new Foo('qux', 100)
        expect(foo.constructor).toEqual(Foo)
        expect(foo.age).toEqual(100)
        expect(foo.foo()).toEqual('bar')
      })

      it('overrides proto', () => {
        const decorator = constructDecorator(({targetType, target}) => {
          if (targetType === METHOD) {
            return () => {
              return target().toUpperCase()
            }
          }
        })

        @decorator()
        class Foo {

          foo() {
            return 'bar'
          }

          baz() {
            return 'baz'
          }

        }

        const foo = new Foo()
        expect(foo.constructor).toEqual(Foo)
        expect(foo.foo()).toEqual('BAR')
        expect(foo.baz()).toEqual('BAZ')
      })

      it('has no effect if handler returns null', () => {
        const decorator = constructDecorator(noop)

        @decorator()
        class Foo {

          foo() {
            return 'bar'
          }

          baz() {
            return 'baz'
          }

        }

        const foo = new Foo()
        expect(foo.constructor).toEqual(Foo)
        expect(foo.foo()).toEqual('bar')
        expect(foo.baz()).toEqual('baz')
      })
    })

    describe('for method', () => {
      it('replaces target with the new impl', () => {
        const decorator = constructDecorator(({targetType, target, args: [param]}) => {
          if (targetType === METHOD) {
            return value => param || 'qux'
          }
        })

        class Foo {

          @decorator()
          foo() {
            return 'bar'
          }

          @decorator('BAZ')
          baz() {
            return 'baz'
          }

        }

        const foo = new Foo()
        expect(foo.constructor).toEqual(Foo)
        expect(foo.foo()).toEqual('qux')
        expect(foo.baz()).toEqual('BAZ')
      })

      it('has no effect if handler returns null', () => {
        const decorator = constructDecorator(noop)

        class Foo {

          @decorator('abc')
          foo() {
            return 'bar'
          }

          @decorator('BAZ')
          baz() {
            return 'baz'
          }

        }

        const foo = new Foo()
        expect(foo.constructor).toEqual(Foo)
        expect(foo.foo()).toEqual('bar')
        expect(foo.baz()).toEqual('baz')
      })
    })

    describe('for field', () => {
      it('allows to attach some meta', () => {
        const meta = {}
        const decorator = constructDecorator(
          ({targetType, propName, args: [param]}) => {
            if (targetType === FIELD && propName) {
              meta[propName] = param
            }
          },
        )

        class Foo {

          @decorator('arg')
          foo = 'bar'

          baz = 'qux'

        }

        expect(meta).toEqual({
          foo: 'arg',
        })
      })
    })

    describe('for weird type', () => {
      it('returns undefined', () => {
        const decorator = constructDecorator(noop)
        expect(decorator(noop)({})).toBeUndefined()
      })
    })

    it('asserts allowedType if defined', () => {
      const decorator = constructDecorator(({targetType, target, args: [param]}) => {
        return value => param || 'qux'
      }, METHOD)

      expect(() => {
        @decorator()
        class Foo {

          foo() {
            return 'bar'
          }

          baz() {
            return 'baz'
          }

        }

        return new Foo()
      }).toThrow('Decorator is compatible with \'method\' only, but was applied to \'class\'')

      expect(() => {
        class Foo {

          @decorator()
          foo() {
            return 'bar'
          }

        }

        return new Foo()
      }).not.toThrow()
    })

    it('empty allowedType array should be ignored', () => {
      const decorator = constructDecorator(
        ({targetType, target, args: [param]}) => (value) => param || 'qux',
        [],
      )

      expect(() => {
        @decorator()
        class Foo {

          @decorator()
          foo() {
            return 'bar'
          }

        }

        return new Foo()
      }).not.toThrow()
    })
  })
})
