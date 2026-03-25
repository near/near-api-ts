import { createContext, type ReactNode, useContext } from 'react';
import { useStore } from 'zustand/react';
import type { NearState, NearStore } from '../../types/store.ts';

const NearStoreContext = createContext<NearStore | null>(null);

export const NearStoreProvider = (props: { children: ReactNode; nearStore: NearStore }) => (
  <NearStoreContext.Provider value={props.nearStore}>{props.children}</NearStoreContext.Provider>
);

export const useNearStore = <T extends unknown>(selector: (s: NearState) => T): T => {
  const store = useContext(NearStoreContext);

  if (!store) throw new Error('useNearStore must be used within NearStoreProvider'); // TODO throw ReactNearTsError

  return useStore(store, selector);
};
