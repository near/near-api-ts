import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { AccountId, BlockHeight, Result, TransactionNonce } from '../common';
import type { PublicKey } from '../crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';
import type { SafeSignData } from '../signData';
import type { DelegatedAction, SignedDelegation } from './actions/executeDelegation/delegation';

export interface SignDelegationPublicErrorRegistry {
  'SignDelegation.Args.InvalidSchema': InvalidSchemaErrorContext;
  'SignDelegation.SignData.Failed': { cause: unknown };
  'SignDelegation.Internal': InternalErrorContext;
}

type DelegationArgs =
  | {
      senderAccountId: AccountId;
      senderPublicKey: PublicKey;
      delegatedAction: DelegatedAction;
      delegatedActions?: never;
      receiverAccountId: AccountId;
      nonce: TransactionNonce;
      expireAt: { blockHeight: BlockHeight };
    }
  | {
      senderAccountId: AccountId;
      senderPublicKey: PublicKey;
      delegatedAction?: never;
      delegatedActions: DelegatedAction[];
      receiverAccountId: AccountId;
      nonce: TransactionNonce;
      expireAt: { blockHeight: BlockHeight };
    };

export type SignDelegationArgs<SDE = unknown> = {
  delegation: DelegationArgs;
  signDataProvider: { safeSignData: SafeSignData<SDE> };
};

type SignDelegationOutput = SignedDelegation;

type SignDelegationError<SDE> =
  | NatError<'SignDelegation.Args.InvalidSchema'>
  | NatError<'SignDelegation.SignData.Failed', { cause: SDE }>
  | NatError<'SignDelegation.Internal'>;

export type SafeSignDelegation = <SDE = unknown>(
  args: SignDelegationArgs<SDE>,
) => Promise<Result<SignDelegationOutput, SignDelegationError<SDE>>>;

export type SignDelegation = <SDE = unknown>(
  args: SignDelegationArgs<SDE>,
) => Promise<SignDelegationOutput>;
