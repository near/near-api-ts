import type { UseMutationResult } from '@tanstack/react-query';

export type UseNearConnect = () => {
  connect: UseMutationResult<void, unknown, void, unknown>;
  disconnect: UseMutationResult<void, unknown, void, unknown>;
};
