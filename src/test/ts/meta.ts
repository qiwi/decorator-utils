import type { IMetadataProvider } from '@qiwi/substrate'

import { injectMeta } from '../../main/ts'
import { get, set } from '../../main/ts/utils'

describe('injectMeta', () => {
  const scope = '__scope__'
  const metadata = new WeakMap()
  const prv: IMetadataProvider = {
    defineMetadata(metadataKey: symbol | string, metadataValue: any, target: object): void {
      const entry = metadata.get(target) || {}
      const next = set(entry, metadataKey, metadataValue)
      metadata.set(target, next)
    },
    hasMetadata(metadataKey: symbol | string, target: object): boolean {
      return !!this.getMetadata(metadataKey, target)
    },
    getMetadata(metadataKey: symbol | string, target: object): any {
      return get(metadata.get(target), metadataKey)
    },
    getOwnMetadata(metadataKey: symbol | string, target: object): any {
      return this.getMetadata(metadataKey, target)
    },
  }

  it('attaches item if prev value was an array', () => {
    const target = {}
    injectMeta(prv, scope, 'foo', ['bar'], target)
    injectMeta(prv, scope, 'foo', 'baz', target)

    expect(prv.getMetadata(scope, target)).toEqual({ foo: ['bar', 'baz'] })
  })

  it('replaces value otherwise', () => {
    const target = {}
    injectMeta(prv, scope, 'foo', 'bar', target)
    injectMeta(prv, scope, 'foo', 'baz', target)

    expect(prv.getMetadata(scope, target)).toEqual({ foo: 'baz' })
  })
})
