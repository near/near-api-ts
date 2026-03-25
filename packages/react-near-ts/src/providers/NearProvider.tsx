import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { NearStore } from '../../types/store.ts';
import { NearStoreProvider } from '../store/NearStoreProvider.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

type NearProviderProps = {
  nearStore: NearStore;
  children: ReactNode;
};

export const NearProvider = (props: NearProviderProps) => (
  <NearStoreProvider nearStore={props.nearStore}>
    <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
  </NearStoreProvider>
);
