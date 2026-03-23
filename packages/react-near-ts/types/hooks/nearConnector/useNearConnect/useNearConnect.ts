import type { MutationOptions } from '../../_common/tanstackMutation.ts';
import type {
  WithAddFunctionCallKeyArgs, WithAddFunctionCallKeyOutput
} from './withAddFunctionCallKey.ts';
import type { WithSignMessageArgs, WithSignMessageOutput } from './withSignMessage.ts';
import type {
  WithoutAdditionalActionArgs, WithoutAdditionalActionOutput
} from './withoutAdditionalAction.ts';

export type InnerUseNearConnectArgs = {
  additionalAction?: 'SignMessage' | 'AddFunctionCallKey';
  mutation?: MutationOptions<any, any, any, any>;
};

export type UseNearConnect<OnMutateResult = unknown> = {
  (args: WithSignMessageArgs<OnMutateResult>): WithSignMessageOutput<OnMutateResult>;
  (args: WithAddFunctionCallKeyArgs<OnMutateResult>): WithAddFunctionCallKeyOutput<OnMutateResult>;
  (
    args?: WithoutAdditionalActionArgs<OnMutateResult>,
  ): WithoutAdditionalActionOutput<OnMutateResult>;
};
