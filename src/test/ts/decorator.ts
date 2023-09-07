import {
  constructDecorator,
  createDecorator,
  getTargetType,
  CLASS,
  FIELD,
  METHOD,
  PARAM,
  IDecoratorContext
} from '../../main/ts'
import 'reflect-metadata'

const echo = <V = any>(v: V): V => v
const noop = () => {
  /* noop */
}

describe('decoratorUtils tsc', () => {
  describe('#getTargetType', () => {
    const cases = [
      ['function', [noop], CLASS],
      ['class', [class Foo {}], CLASS],
      ['obj-str-{value: fn}', [{}, 'str', { value: noop }], METHOD],
      ['obj-str-obj', [{}, 'str', {}], FIELD],
      ['obj-str-null', [{}, 'str', {}], FIELD],
      ['null', [null], null],
    ]

    cases.forEach(([title, args, expected]) => {
      it(`detects ${title} as ${expected}`, () => {
        // @ts-ignore
        expect(getTargetType.apply(null, args)).toEqual(expected) // eslint-disable-line prefer-spread
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

    it('keeps descriptor.value metadata', () => {
      const DecoratorWithMeta = constructDecorator(({ descriptor, target }, ) => {
        Reflect.defineMetadata('foo', 42, descriptor?.value)
        return target
      })

      const Decorator = constructDecorator(() => {
        return function () {
          return '42'
        }
      })

      class TestController {
        @DecoratorWithMeta()
        @Decorator()
        foo() {
          return 42
        }

        @Decorator()
        @DecoratorWithMeta()
        bar() {
          return 2007
        }
      }

      const fooDescriptor = Object.getOwnPropertyDescriptor(TestController.prototype, 'foo')!
      expect(Reflect.getMetadata('foo', fooDescriptor.value)).toEqual(42)

      const barDescriptor = Object.getOwnPropertyDescriptor(TestController.prototype, 'bar')!
      expect(Reflect.getMetadata('foo', barDescriptor.value)).toEqual(42)
    })
  })

  describe('decorator', () => {
    describe('for class/constructor', () => {
      it('extends target class', () => {
        const addAge = constructDecorator(
          ({ targetType, target, args: [age] }: IDecoratorContext) => {
            if (targetType === CLASS) {
              return class Bar extends target {
                age: number
                constructor(name: string) {
                  super(name)
                  this.age = age
                }
              }
            }
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
        const decorator = constructDecorator(({ targetType, target }) => {
          if (targetType === METHOD) {
            return () => target().toUpperCase()
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
        const decorator = constructDecorator(
          ({ targetType, target, args: [param] }) => {
            if (targetType === METHOD) {
              return (value: unknown) => param || 'qux'
            }
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
        const decorator = constructDecorator(
          ({ propName }: IDecoratorContext) => () => propName,
        )

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
        const decorator = constructDecorator(
          ({
            propName,
            paramIndex,
            targetType,
            target,
          }: IDecoratorContext) => {
            if (
              targetType === PARAM &&
              propName &&
              typeof paramIndex === 'number'
            ) {
              meta[propName] = meta[propName] || {}
              meta[propName][paramIndex] = target
            }
          },
        )

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
      it('allows to attach some meta', () => {
        const meta: any = {}
        const decorator = constructDecorator(
          ({ targetType, propName, target, args: [param] }): void => {
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
      const decorator = constructDecorator(
        ({ targetType, target, args: [param] }) => {
          return (value: unknown) => param || 'qux'
        },
        [METHOD, FIELD],
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
      }).toThrow(
        "Decorator is compatible with 'method', 'field' only, but was applied to 'class'",
      )

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
        ({ targetType, target, args: [param] }) => {
          if (targetType === 'class') return class Bar {}
          if (targetType === 'method') return (value: unknown) => param || 'qux'
        },
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

    it('applies several decorators at once', () => {
      const plus = constructDecorator(
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

      const foo = new Foo()

      expect(foo.bar(1)).toBe(4)
    })
  })

  describe('handles `repeatable` option', () => {
    const Repeatable = constructDecorator(({target}) => target, { repeatable: true })
    const NonRepeatable = constructDecorator(({target}) => target, { repeatable: false })

    it('for classes', () => {
      try {
        @NonRepeatable()
        @NonRepeatable()
        class Foo {}

        throw new Error('foo')
      } catch (e: any){
        expect(e.message).toBe('Decorator is not repeatable for \'class\'')
      }

      @Repeatable()
      @Repeatable()
      class Bar {}
    })

    it('for methods', () => {
      try {
        class Foo {
          @NonRepeatable()
          @NonRepeatable()
          f() { return 'f' }
        }

        throw new Error('foo')
      } catch (e: any){
        expect(e.message).toBe('Decorator is not repeatable for \'method\'')
      }

      class Bar {
        @Repeatable()
        @Repeatable()
        b() { return 'b' }
      }
    })
  })

  describe('context', () => {
    it('allows to operate with meta', () => {
      const meta: any = []
      const decorator = constructDecorator(
        (context: IDecoratorContext) => {
          meta.push(context)
        },
      )

      @decorator('class')
      class Foo {
        @decorator('method')
        foo(@decorator('p0') a: any, b: any, @decorator('p2') c: any) {
          return 'foo'
        }
      }

      expect(meta).toEqual([
        {
          kind: PARAM,
          targetType: PARAM,
          target: Foo.prototype.foo,
          name: 'foo',
          propName: 'foo',
          paramIndex: 2,
          ctor: Foo,
          proto: Foo.prototype,
          args: ['p2'],
        },
        {
          kind: PARAM,
          targetType: PARAM,
          target: Foo.prototype.foo,
          name: 'foo',
          propName: 'foo',
          paramIndex: 0,
          ctor: Foo,
          proto: Foo.prototype,
          args: ['p0'],
        },
        {
          kind: METHOD,
          targetType: METHOD,
          target: Foo.prototype.foo,
          name: 'foo',
          propName: 'foo',
          ctor: Foo,
          proto: Foo.prototype,
          args: ['method'],
          descriptor: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: expect.any(Function),
          },
        },
        {
          args: [ 'class' ],
          name: 'foo',
          propName: 'foo',
          kind: 'method',
          targetType: 'method',
          target: Foo.prototype.foo,
          ctor: Foo,
          proto: Foo.prototype,
          descriptor: {
            value: Foo.prototype.foo,
            writable: true,
            enumerable: false,
            configurable: true
          }
        },
        {
          kind: CLASS,
          targetType: CLASS,
          target: Foo,
          ctor: Foo,
          proto: Foo.prototype,
          args: ['class']
        },
      ])
    })
  })
})
