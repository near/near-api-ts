import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Result } from '../../../common';
import type { NearcorePublicKey, PublicKey } from '../../../crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';
import type { NearTokenArgs } from '../../../nearToken';

export interface CreateTopUpAccessKeyBalanceActionPublicErrorRegistry {
  'CreateAction.TopUpAccessKeyBalance.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.TopUpAccessKeyBalance.Internal': InternalErrorContext;
}

export type CreateTopUpAccessKeyBalanceActionArgs = {
  publicKey: PublicKey;
  amount: NearTokenArgs;
};

/**
 * Moves `amount` from the receiver account's balance to the balance of its key `publicKey` - a key
 * with `gasPayment.source: 'KeyBalance'`, which pays for gas from that balance. Anyone can top up
 * a key of any account, the way anyone can transfer to it. Nearcore calls it `TransferToGasKey`.
 */
export type TopUpAccessKeyBalanceAction = {
  actionType: 'TopUpAccessKeyBalance';
  publicKey: PublicKey;
  amount: NearTokenArgs;
};

type CreateTopUpAccessKeyBalanceActionError =
  | NatError<'CreateAction.TopUpAccessKeyBalance.Args.InvalidSchema'>
  | NatError<'CreateAction.TopUpAccessKeyBalance.Internal'>;

export type SafeCreateTopUpAccessKeyBalanceAction = (
  args: CreateTopUpAccessKeyBalanceActionArgs,
) => Result<TopUpAccessKeyBalanceAction, CreateTopUpAccessKeyBalanceActionError>;

export type CreateTopUpAccessKeyBalanceAction = (
  args: CreateTopUpAccessKeyBalanceActionArgs,
) => TopUpAccessKeyBalanceAction;

// ****** NEARCORE ********

export type NearcoreTopUpAccessKeyBalanceAction = {
  transferToGasKey: {
    publicKey: NearcorePublicKey;
    deposit: bigint;
  };
};
