import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Prettify } from '../../../../utils';
import type { FullAccessPermission, FunctionCallPermission } from '../../../accessKey';
import type { AccountId, ContractFunctionName, Result } from '../../../common';
import type { NearcorePublicKey, PublicKey } from '../../../crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';
import type { NearTokenArgs } from '../../../nearToken';

export interface CreateAddAccessKeyActionPublicErrorRegistry {
  'CreateAction.AddAccessKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.AddAccessKey.Internal': InternalErrorContext;
}

/**
 * The key keeps `totalSequences` (1..1024) independent nonce sequences, so it can sign
 * that many transactions in parallel.
 */
type NonceSequenceSetArgs = {
  totalSequences: number;
};

// ── Paid from the account balance ────────────────────────────

type AccountBalanceFullAccessKeyArgs = {
  publicKey: PublicKey;
  permission: FullAccessPermission;
  gasPayment: {
    source: 'AccountBalance';
    allowance?: never;
  };
  replayProtection?: never;
};

type AccountBalanceFunctionCallKeyArgs = {
  publicKey: PublicKey;
  permission: FunctionCallPermission;
  gasPayment: {
    source: 'AccountBalance';
    allowance: 'Unlimited' | NearTokenArgs;
  };
  replayProtection?: never;
};

// ── Paid from the key balance ────────────────────────────────
// Nearcore calls such a key a gas key. It is added with an empty balance and funded afterwards.

type KeyBalanceFullAccessKeyArgs = {
  publicKey: PublicKey;
  permission: FullAccessPermission;
  gasPayment: {
    source: 'KeyBalance';
  };
  replayProtection: NonceSequenceSetArgs;
};

type KeyBalanceFunctionCallKeyArgs = {
  publicKey: PublicKey;
  permission: FunctionCallPermission;
  gasPayment: {
    source: 'KeyBalance';
  };
  replayProtection: NonceSequenceSetArgs;
};

export type CreateAddAccessKeyActionArgs =
  | AccountBalanceFullAccessKeyArgs
  | AccountBalanceFunctionCallKeyArgs
  | KeyBalanceFullAccessKeyArgs
  | KeyBalanceFunctionCallKeyArgs;

export type AddAccessKeyAction = Prettify<
  { actionType: 'AddAccessKey' } & CreateAddAccessKeyActionArgs
>;

type CreateAddAccessKeyActionError =
  | NatError<'CreateAction.AddAccessKey.Args.InvalidSchema'>
  | NatError<'CreateAction.AddAccessKey.Internal'>;

export type SafeCreateAddAccessKeyAction = (
  args: CreateAddAccessKeyActionArgs,
) => Result<AddAccessKeyAction, CreateAddAccessKeyActionError>;

export type CreateAddAccessKeyAction = (args: CreateAddAccessKeyActionArgs) => AddAccessKeyAction;

// ****** NEARCORE ********

export type NearcoreFunctionCallPermission = {
  receiverId: AccountId;
  allowance: bigint | null;
  methodNames: ContractFunctionName[];
};

type NearcoreGasKeyInfo = {
  balance: bigint;
  numNonces: number;
};

export type NearcoreAccessKeyPermission =
  | { functionCall: NearcoreFunctionCallPermission }
  | { fullAccess: {} }
  | {
      gasKeyFunctionCall: {
        gasKeyInfo: NearcoreGasKeyInfo;
        functionCallPermission: NearcoreFunctionCallPermission;
      };
    }
  | { gasKeyFullAccess: NearcoreGasKeyInfo };

export type NearcoreAddAccessKeyAction = {
  addKey: {
    publicKey: NearcorePublicKey;
    accessKey: {
      nonce: bigint;
      permission: NearcoreAccessKeyPermission;
    };
  };
};
