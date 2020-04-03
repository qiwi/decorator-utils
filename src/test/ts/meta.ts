import {injectMeta} from '../../main/ts'
import {IMetadataProvider} from '@qiwi/substrate'
import {set, get} from '../../main/ts/utils'

describe('injectMeta', () => {
  const scope = '__scope__'
  const metadata = new WeakMap()
  const prv: IMetadataProvider = {
    defineMetadata(metadataKey: any, metadataValue: any, target: any): void {
      const entry = metadata.get(target) || {}
      const next = set(entry, metadataKey, metadataValue)
      metadata.set(target, next)
    },
    hasMetadata(metadataKey: any, target: any): boolean {
      return !!this.getMetadata(metadataKey, target)
    },
    getMetadata(metadataKey: any, target: any): any {
      return get(metadata.get(target), metadataKey)
    },
    getOwnMetadata(metadataKey: any, target: any): any {
      return this.getMetadata(metadataKey, target)
    },
  }

  it('attaches item if prev value was an array', () => {
    const target = {}
    injectMeta(prv, scope, 'foo', ['bar'], target)
    injectMeta(prv, scope, 'foo', 'baz', target)

    expect(prv.getMetadata(scope, target)).toEqual({foo: ['bar', 'baz']})
  })

  it('replaces value otherwise', () => {
    const target = {}
    injectMeta(prv, scope, 'foo', 'bar', target)
    injectMeta(prv, scope, 'foo', 'baz', target)

    expect(prv.getMetadata(scope, target)).toEqual({foo: 'baz'})
  })
})
