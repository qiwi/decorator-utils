import chai from 'chai'
const { expect } = chai

import {getPrototypeMethods} from '../src/utils'

describe('utils.js', () => {
  describe('#getPrototypeMethods', () => {
    class Foo {
      bar () {}
      baz () {}
    }
    const foo = new Foo()

    it('resolves from class/constructor', () => {
      expect(Object.keys(getPrototypeMethods(foo))).to.deep.equal(['bar', 'baz'])
    })

    it('resolves from instance', () => {
      expect(Object.keys(getPrototypeMethods(foo))).to.deep.equal(['bar', 'baz'])
    })
  })
})
