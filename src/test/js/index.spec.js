import factory, {
  constructDecorator,
  getTargetType,
  assertTargetType,
  METHOD,
  FIELD,
  CLASS,
  TARGET_TYPES
} from '../../../dist'

describe('index.js', () => {
  it('properly exposes inners', () => {
    expect(typeof factory).toBe('function')
    expect(constructDecorator).toEqual(factory)
    expect(typeof getTargetType).toBe('function')
    expect(typeof assertTargetType).toBe('function')

    expect(typeof METHOD).toBe('string')
    expect(typeof FIELD).toBe('string')
    expect(typeof CLASS).toBe('string')
    expect(typeof TARGET_TYPES).toBe('object')
  })
})
