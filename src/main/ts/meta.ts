import { IMetadataProvider } from '@qiwi/substrate'

import { get, set } from './utils'

export const injectMeta = (
  prv: IMetadataProvider,
  scope: string,
  path: string,
  value: unknown,
  target: any,
): void => {
  const meta = prv.getOwnMetadata(scope, target) || {}
  const prev = get(meta, path)
  const next = Array.isArray(prev) ? prev.concat(value) : value

  prv.defineMetadata(scope, set(meta, path, next), target)
}
