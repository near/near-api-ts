import type { Result } from './common';
import type { PublicKey } from './crypto';
import type {
  DelegationBase,
  MultiDelegableActions,
  SingleDelegableAction,
} from './transaction/actions/executeDelegation/delegation';
import type { SignDelegationOutput } from './transaction/signDelegation';
import type { SignTransactionOutput } from './transaction/signTransaction';
import type { Transaction } from './transaction/transaction';
import type { GetPublicKeyArgs, HasKeyPairArgs } from './vault';

export type SignTransactionArgs = { transaction: Transaction };

export type SignDelegationArgs = {
  delegation: DelegationBase & (SingleDelegableAction | MultiDelegableActions);
};

/**
 * What a signer needs from a sign service: whether the service can sign by a key, the full
 * public key of such a key, found by the id an account lists the key under, a signed
 * transaction and a signed delegation. Where the keys are kept, and how the service signs by
 * them, is up to the service.
 */
export type SignService = {
  safeHasKeyPair: (args: HasKeyPairArgs) => Promise<Result<boolean, unknown>>;
  safeGetPublicKey: (args: GetPublicKeyArgs) => Promise<Result<PublicKey, unknown>>;
  safeSignTransaction: (
    args: SignTransactionArgs,
  ) => Promise<Result<SignTransactionOutput, unknown>>;
  safeSignDelegation: (args: SignDelegationArgs) => Promise<Result<SignDelegationOutput, unknown>>;
};
