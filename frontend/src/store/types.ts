import { StoreApi, UseBoundStore } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { store: { [K in keyof T]: () => T[K] } }
  : never

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  let store = _store as WithSelectors<typeof _store>
  store.store = {}
  for (let k of Object.keys(store.getState())) {
    ;(store.store as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}
