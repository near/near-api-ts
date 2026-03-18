import type { PublicKey } from '../../crypto';
import type { NatError } from '../../../../src/_common/natError';
import type { Result } from '../../common';
import type { NativePublicKey } from '../../crypto';
import type { NearTokenArgs } from '../../nearToken';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../natError';

export interface CreateStakeActionPublicErrorRegistry {
  'CreateAction.Stake.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.Stake.Internal': InternalErrorContext;
}

export type CreateStakeActionArgs = {
  amount: NearTokenArgs;
  validatorPublicKey: PublicKey;
};

export type StakeAction = {
  actionType: 'Stake';
  amount: NearTokenArgs;
  validatorPublicKey: PublicKey;
};

type CreateStakeActionError =
  | NatError<'CreateAction.Stake.Args.InvalidSchema'>
  | NatError<'CreateAction.Stake.Internal'>;

export type SafeCreateStakeAction = (
  args: CreateStakeActionArgs,
) => Result<StakeAction, CreateStakeActionError>;

export type CreateStakeAction = (args: CreateStakeActionArgs) => StakeAction;

// ****** NATIVE ********

export type NativeStakeAction = {
  stake: {
    stake: bigint;
    publicKey: NativePublicKey;
  };
};
