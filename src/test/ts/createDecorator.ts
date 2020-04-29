import {
  createDecorator,
  constructDecorator,
  getTargetType,
  METHOD,
  FIELD,
  CLASS,
  PARAM,
} from '../../main/ts'
import {IDecoratorHandlerContext} from '../../main/ts/interface'

const noop = () => { /* noop */ }

describe('decoratorUtils tsc', () => {
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
        // @ts-ignore
        expect(getTargetType.apply(null, args)).toEqual(expected)
      })
    })
  })

  describe('#constructDecorator', () => {
    it('returns fn', () => {
      const decorator = constructDecorator(noop)
      expect(typeof decorator).toBe('function')
    })

    it('alias to createDecorator', () => {
      expect(createDecorator).toBe(constructDecorator)
    })

    it('throws error if handler is not a func', () => {
      expect(() => {
        // @ts-ignore
        constructDecorator({})
      }).toThrow('Decorator handler must be a function')
    })
  })

  describe('decorator', () => {
    describe('for class/constructor', () => {
      it('extends target class', () => {
        const addAge = constructDecorator(
          ({targetType, target, args: [age]}: IDecoratorHandlerContext) => {
            if (targetType === CLASS) {
              return class Bar extends target {
                age: number
                constructor(name: string) {
                  super(name)
                  this.age = age
                }
              }
            }
            return
          },
        )

        @addAge(100)
        class Foo {

          name: string
          constructor(name: string) {
            this.name = name
          }
          foo() {
            return 'bar'
          }

        }

        const foo = new Foo('qux')
        expect(foo.constructor).toEqual(Foo)
        // @ts-ignore
        expect(foo.age).toEqual(100)
        expect(foo.foo()).toEqual('bar')
      })

      it('overrides proto', () => {
        const decorator = constructDecorator(
          ({targetType, target}) => {
            if (targetType === METHOD) {
              return () => {
                return target().toUpperCase()
              }
            }
            return
          },
        )

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
        const decorator = constructDecorator(
          ({targetType, target, args: [param]}) => {
            if (targetType === METHOD) {
              return (value: unknown) => param || 'qux'
            }
            return
          },
        )

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

      it('verifies that handler returns a function, use prev value if not', () => {
        const decorator = constructDecorator(() => 'not-a-function')

        class Foo {

          @decorator('abc')
          foo() {
            return 'bar'
          }

        }

        const foo = new Foo()
        expect(foo.constructor).toEqual(Foo)
        expect(foo.foo()).toEqual('bar')
      })

      it('operates with method name', () => {
        const decorator = constructDecorator(({propName}: IDecoratorHandlerContext) => () => propName)

        class Foo {

          @decorator()
          foo() {
            return 'bar'
          }

        }

        const foo = new Foo()
        expect(foo.constructor).toEqual(Foo)
        expect(foo.foo()).toEqual('foo')
      })
    })

    describe('for param', () => {
      it('allows to attach some meta', () => {
        const meta: any = {}
        const decorator = constructDecorator(({propName, paramIndex, targetType, target}: IDecoratorHandlerContext) => {
          if (targetType === PARAM) {
            if (propName && typeof paramIndex === 'number') {
              meta[propName] = meta[propName] || {}
              meta[propName][paramIndex] = target
            }
          }
        })

        class Foo {

          foo(@decorator() one: any, two: any, @decorator() three: any) {
            return 'foo'
          }

          bar(one: any, @decorator() two: any) {
            return 'bar'
          }

        }

        expect(meta).toEqual({
          foo: {
            0: Foo.prototype.foo,
            2: Foo.prototype.foo,
          },
          bar: {
            1: Foo.prototype.bar,
          },
        })
      })
    })

    describe('for field', () => {
      it('replaces target initializer', () => {
        const prefix = constructDecorator(
          ({targetType, target, args: [param]}): unknown => {
            if (targetType === FIELD) {
              return () => (param || '') + target()
            }
            return
          },
        )

        class Foo {

          @prefix('_')
          foo = 'bar'
          @prefix('__')
          baz = 'qux'

        }

        const foo = new Foo()
        expect(foo.constructor).toEqual(Foo)
        expect(foo.foo).toEqual('_bar')
        expect(foo.baz).toEqual('__qux')
      })

      it('has no effect if handler returns null', () => {
        const decorator = constructDecorator(noop)

        class Foo {

          @decorator('abc')
          foo = 'bar'
          @decorator('BAZ')
          baz = 'qux'

        }

        const foo = new Foo()
        expect(foo.constructor).toEqual(Foo)
        expect(foo.foo).toEqual('bar')
        expect(foo.baz).toEqual('qux')
      })
    })

    describe('for weird type', () => {
      it('returns undefined', () => {
        const decorator = constructDecorator(noop)
        expect(decorator(noop)({})).toBeUndefined()
      })
    })

    it('asserts allowedType if defined', () => {
      const decorator = constructDecorator(
        ({targetType, target, args: [param]}) => {
          return (value: unknown) => param || 'qux'
        },
        METHOD,
      )

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
      }).toThrow('Decorator must be applied to allowed types only: method')

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

    it('applies several decorators at once', () => {
      const plus = constructDecorator(
        ({targetType, target, args: [param]}) => {
          return (value: number) => target(value) + param
        },
        METHOD,
      )

      class Foo {

        @plus(2)
        @plus(1)
        bar(v: number) {
          return v
        }

      }

      const foo = new Foo()

      expect(foo.bar(1)).toBe(4)
    })
  })

  describe('context', () => {
    it('allows to operate with meta', () => {
      const meta: any = {}
      const decorator = constructDecorator((context: IDecoratorHandlerContext) => {
        const {args: [arg]} = context
        meta[arg] = context
      })

      @decorator('class')
      class Foo {

        @decorator('method')
        foo(@decorator('p0') a: any, b: any, @decorator('p2') c: any) {
          return 'foo'
        }

      }

      expect(meta).toEqual({
        class: {
          targetType: CLASS,
          target: Foo,
          ctor: Foo,
          proto: Foo.prototype,
          args: ['class'],
        },
        method: {
          targetType: METHOD,
          target: Foo.prototype.foo,
          propName: 'foo',
          ctor: Foo,
          proto: Foo.prototype,
          args: ['method'],
        },
        p0: {
          targetType: PARAM,
          target: Foo.prototype.foo,
          propName: 'foo',
          paramIndex: 0,
          ctor: Foo,
          proto: Foo.prototype,
          args: ['p0'],
        },
        p2: {
          targetType: PARAM,
          target: Foo.prototype.foo,
          propName: 'foo',
          paramIndex: 2,
          ctor: Foo,
          proto: Foo.prototype,
          args: ['p2'],
        },
      })
    })
  })
})
