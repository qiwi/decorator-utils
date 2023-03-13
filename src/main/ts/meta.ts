import type {ICallable, IMetadataProvider} from '@qiwi/substrate'

import {get, set} from './utils'
import {CLASS} from './resolver'

export const injectMeta = (
  prv: IMetadataProvider,
  scope: string,
  path: string,
  value: unknown,
  target: any,
): void => {
  const meta = prv.getOwnMetadata(scope, target) || {}
  const prev = get(meta, path)
  const next = Array.isArray(prev) ? [...prev, value] : value

  prv.defineMetadata(scope, set(meta, path, next), target)
}

export type TRefStore = {
  methodRefs: Map<string, WeakSet<ICallable>>
  classRefs: WeakSet<ICallable>
}

const stores = new WeakMap<any, TRefStore>()
export const getRefStore = (ctx: any): TRefStore => {
  if (!stores.has(ctx)) {
    stores.set(ctx, {
      methodRefs: new Map(),
      classRefs: new WeakSet(),
    })
  }

  return stores.get(ctx) as TRefStore
}

export const setRef = (kind: 'method' | 'class', {
  classRefs,
  methodRefs
}: TRefStore, ctor: ICallable, name = ''): void => {
  if (kind === CLASS) {
    classRefs.add(ctor)
    return
  }

  if (!methodRefs.has(name)) {
    methodRefs.set(name, new WeakSet())
  }
  methodRefs.get(name)?.add(ctor)
}

export const getRef = (kind: string, {
  classRefs,
  methodRefs
}: TRefStore, name = ''): WeakSet<ICallable> => {
  if (kind === CLASS) {
    return classRefs
  }

  return methodRefs.get(name) || new Set()
}
