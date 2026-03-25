import type { MutateOptions } from '@tanstack/react-query';
import type { BaseUseMutationResult, MutationOptions } from '../_common/tanstackMutation.ts';

type UseNearDisconnectArgs<OMR, D = void, E = Error, V = void> = {
  mutation?: MutationOptions<D, E, V, OMR>;
};

type UseNearDisconnectResult<OMR, D = void, E = Error, V = void> = {
  disconnect: (args?: MutateOptions<D, E, V, OMR>) => void;
  disconnectAsync: (args?: MutateOptions<D, E, V, OMR>) => Promise<D>;
} & BaseUseMutationResult<D, E, V, OMR>;

export type UseNearDisconnect = <OMR = unknown>(
  args?: UseNearDisconnectArgs<OMR>,
) => UseNearDisconnectResult<OMR>;
