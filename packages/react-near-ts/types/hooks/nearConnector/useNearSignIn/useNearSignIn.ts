import type { MutationOptions } from '../../_common/tanstackMutation.ts';
import type {
  WithAddFunctionCallKeyArgs,
  WithAddFunctionCallKeyOutput,
} from './withAddFunctionCallKey.ts';
import type {
  WithoutAdditionalActionArgs,
  WithoutAdditionalActionOutput,
} from './withoutAdditionalAction.ts';
import type { WithSignMessageArgs, WithSignMessageOutput } from './withSignMessage.ts';

export type InnerUseNearSignInArgs = {
  additionalAction?: 'SignMessage' | 'AddFunctionCallKey';
  mutation?: MutationOptions<any, any, any, any>;
};

export type UseNearSignIn<OnMutateResult = unknown> = {
  (args: WithSignMessageArgs<OnMutateResult>): WithSignMessageOutput<OnMutateResult>;
  (args: WithAddFunctionCallKeyArgs<OnMutateResult>): WithAddFunctionCallKeyOutput<OnMutateResult>;
  (
    args?: WithoutAdditionalActionArgs<OnMutateResult>,
  ): WithoutAdditionalActionOutput<OnMutateResult>;
};
