import type { PublicKey, AccountId, GasBudget, AllowedFunctions } from 'near-api-ts';
import type { MutateOptions } from '@tanstack/react-query';
import type { BaseUseMutationResult, MutationOptions } from '../../_common/tanstackMutation.ts';
import type { Prettify } from '../../../_common/common.ts';

export type Variables = {
  publicKey: PublicKey;
  contractAccountId: AccountId;
  gasBudget: GasBudget;
  allowedFunctions: AllowedFunctions;
};

type Data = void;
type Err = Error;

export type WithAddFunctionCallKeyArgs<OnMutateResult> = {
  additionalAction: 'AddFunctionCallKey';
  mutation?: MutationOptions<Data, Err, Variables, OnMutateResult>;
};

type ConnectArgs<OnMutateResult> = Prettify<
  Variables & { mutate?: MutateOptions<Data, Err, Variables, OnMutateResult> }
>;

export type WithAddFunctionCallKeyOutput<OnMutateResult> = {
  connect: (args: ConnectArgs<OnMutateResult>) => void;
  connectAsync: (args: ConnectArgs<OnMutateResult>) => Promise<Data>;
} & BaseUseMutationResult<Data, Err, Variables, OnMutateResult>;
