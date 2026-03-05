import { createContext, useContext, type ReactNode } from 'react';
import type { NearStore, NearState } from './nearStore.ts';
import { useStore } from 'zustand/react';

const NearStoreContext = createContext<NearStore | null>(null);

export const NearStoreProvider = (props: {
  children: ReactNode;
  nearStore: NearStore;
}) => (
  <NearStoreContext.Provider value={props.nearStore}>
    {props.children}
  </NearStoreContext.Provider>
);

export const useNearStore = <T extends unknown>(
  selector: (s: NearState) => T,
): T => {
  const store = useContext(NearStoreContext);

  if (!store)
    throw new Error('useNearStore must be used within NearStoreProvider'); // TODO throw ReactNearTsError

  return useStore(store, selector);
};
