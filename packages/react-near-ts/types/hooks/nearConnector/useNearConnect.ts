import type { MutateOptions } from '@tanstack/react-query';
import type { MutationOptions, BaseUseMutationResult } from '../_common/tanstackMutation.ts';
import type { Message, SignedMessage } from 'near-api-ts';

export type InnerUseNearConnectArgs = {
  additionalAction?: 'SignMessage';
  mutation?: MutationOptions<any, Error, any, any>;
};

export type NoAdditionalAction<OMR = unknown, D = void, E = Error, V = undefined> = {
  args: {
    additionalAction?: never;
    mutation?: MutationOptions<D, E, V, OMR>;
  };
  output: {
    connect: (args?: MutateOptions<D, E, V, OMR>) => void;
    connectAsync: (args?: MutateOptions<D, E, V, OMR>) => Promise<D>;
  } & BaseUseMutationResult<D, E, V, OMR>;
};

export type WithSignMessage<
  OMR = unknown,
  D = SignedMessage,
  E = Error,
  V = { message: Message },
> = {
  args: {
    additionalAction: 'SignMessage';
    mutation?: MutationOptions<D, E, V, OMR>;
  };
  output: {
    connect: (args: V & MutateOptions<D, E, V, OMR>) => void;
    connectAsync: (args: V & MutateOptions<D, E, V, OMR>) => Promise<D>;
  } & BaseUseMutationResult<D, E, V, OMR>;
};

export type UseNearConnect = {
  <OMR = unknown>(args?: NoAdditionalAction<OMR>['args']): NoAdditionalAction<OMR>['output'];
  <OMR = unknown>(args: WithSignMessage<OMR>['args']): WithSignMessage<OMR>['output'];
};
