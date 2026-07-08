import type { MutateOptions } from '@tanstack/react-query';
import type { AccountId, AllowedFunctions, GasBudgetArgs, PublicKey } from 'near-api-ts';
import type { Prettify } from '../../../_common/common.ts';
import type { BaseUseMutationResult, MutationOptions } from '../../_common/tanstackMutation.ts';

export type Variables = {
  publicKey: PublicKey;
  contractAccountId: AccountId;
  gasBudget: GasBudgetArgs;
  allowedFunctions: AllowedFunctions;
};

type Data = {
  connectedAccountId: AccountId;
};

type Err = Error;

export type WithAddFunctionCallKeyArgs<OnMutateResult> = {
  additionalAction: 'AddFunctionCallKey';
  mutation?: MutationOptions<Data, Err, Variables, OnMutateResult>;
};

type ConnectArgs<OnMutateResult> = Prettify<
  Variables & { mutate?: MutateOptions<Data, Err, Variables, OnMutateResult> }
>;

export type WithAddFunctionCallKeyOutput<OnMutateResult> = {
  signIn: (args: ConnectArgs<OnMutateResult>) => void;
  signInAsync: (args: ConnectArgs<OnMutateResult>) => Promise<Data>;
} & BaseUseMutationResult<Data, Err, Variables, OnMutateResult>;
