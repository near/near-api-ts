import type { UseMutationResult } from '@tanstack/react-query';

export type UseNearConnect = () => {
  connect: UseMutationResult<void, Error, void, unknown>;
  disconnect: UseMutationResult<void, Error, void, unknown>;
};
