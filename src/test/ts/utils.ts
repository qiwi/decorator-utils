import {getClassChain, getPrototypeMethods} from '../../main/ts/utils'

describe('utils.js', () => {
  describe('#getPrototypeMethods', () => {
    class Foo {
      bar() {
        /* bar */
      }
      baz() {
        /* baz */
      }
    }
    const foo = new Foo()

    it('resolves from class/constructor', () => {
      expect(Object.keys(getPrototypeMethods(foo))).toEqual(['bar', 'baz'])
    })

    it('resolves from instance', () => {
      expect(Object.keys(getPrototypeMethods(foo))).toEqual(['bar', 'baz'])
    })
  })
})

describe('getClassChain', () => {
  it('returns all prototypes', () => {
    class Foo {}
    class Bar extends Foo {}
    class Baz extends Bar {}

    expect(getClassChain(Baz)).toEqual([Baz, Bar, Foo, Function.prototype, Object.prototype])
  })
})
