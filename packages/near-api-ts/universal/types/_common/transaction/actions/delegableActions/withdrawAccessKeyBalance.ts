import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Result } from '../../../common';
import type { NearcorePublicKey, PublicKey } from '../../../crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';
import type { NearTokenArgs } from '../../../nearToken';

export interface CreateWithdrawAccessKeyBalanceActionPublicErrorRegistry {
  'CreateAction.WithdrawAccessKeyBalance.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.WithdrawAccessKeyBalance.Internal': InternalErrorContext;
}

export type CreateWithdrawAccessKeyBalanceActionArgs = {
  publicKey: PublicKey;
  amount: NearTokenArgs;
};

/**
 * Moves `amount` from the balance of the key `publicKey` - a key with
 * `gasPayment.source: 'KeyBalance'` - back to the receiver account's balance. Only the account
 * itself can do it: the transaction or delegation has to come from the receiver account. Nearcore
 * calls it `WithdrawFromGasKey`.
 */
export type WithdrawAccessKeyBalanceAction = {
  actionType: 'WithdrawAccessKeyBalance';
  publicKey: PublicKey;
  amount: NearTokenArgs;
};

type CreateWithdrawAccessKeyBalanceActionError =
  | NatError<'CreateAction.WithdrawAccessKeyBalance.Args.InvalidSchema'>
  | NatError<'CreateAction.WithdrawAccessKeyBalance.Internal'>;

export type SafeCreateWithdrawAccessKeyBalanceAction = (
  args: CreateWithdrawAccessKeyBalanceActionArgs,
) => Result<WithdrawAccessKeyBalanceAction, CreateWithdrawAccessKeyBalanceActionError>;

export type CreateWithdrawAccessKeyBalanceAction = (
  args: CreateWithdrawAccessKeyBalanceActionArgs,
) => WithdrawAccessKeyBalanceAction;

// ****** NEARCORE ********

export type NearcoreWithdrawAccessKeyBalanceAction = {
  withdrawFromGasKey: {
    publicKey: NearcorePublicKey;
    amount: bigint;
  };
};
