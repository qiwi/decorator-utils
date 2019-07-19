import {getPrototypeMethods} from '../../../target/es5/utils'

describe('utils.js', () => {
  describe('#getPrototypeMethods', () => {
    class Foo {
      bar() {}
      baz() {}
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
