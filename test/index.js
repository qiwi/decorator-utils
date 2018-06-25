import chai from 'chai'
const { expect } = chai

import factory, {
  constructDecorator,
  getTargetType,
  assertTargetType,

  METHOD,
  FIELD,
  CLASS,
  TARGET_TYPES
} from '../dist/index'

describe('index.js', () => {
  it('properly exposes inners', () => {
    expect(factory).to.be.a('function')
    expect(constructDecorator).to.equal(factory)
    expect(getTargetType).to.be.a('function')
    expect(assertTargetType).to.be.a('function')

    expect(METHOD).to.be.a('string')
    expect(FIELD).to.be.a('string')
    expect(CLASS).to.be.a('string')
    expect(TARGET_TYPES).to.be.an('object')
  })
})
