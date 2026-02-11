import type { NearTokenArgs } from '../_common/nearToken';
import type {
  InternalErrorContext,
  InvalidSchemaContext,
} from '../natError';
import type { NatError } from '../../src/_common/natError';
import type { Result } from '../_common/common';
import type { PublicKey } from '@near-js/jsonrpc-types';
import type { NativePublicKey } from '../_common/crypto';

export type CreateStakeActionErrorVariant =
  | {
      kind: 'CreateAction.Stake.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateAction.Stake.Internal';
      context: InternalErrorContext;
    };

export type CreateStakeActionInternalErrorKind = 'CreateAction.Stake.Internal';

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
