import type {
  AccountId,
  Client,
  DelegationIntent,
  Message,
  MultiDelegableActions,
  SignedMessage,
  SingleDelegableAction,
  TransactionIntent,
} from 'near-api-ts';
import type { Prettify } from '../_common/common.ts';
import type { Result } from '../_common.ts';

// ------------------------------------------------------------------------------------------------
// ExecuteTransaction

export type ExecuteTransactionArgs = { intent: TransactionIntent };
export type ExecuteTransactionOutput = { rawRpcResult: unknown };
type ExecuteTransactionError = unknown;

export type SafeExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<Result<ExecuteTransactionOutput, ExecuteTransactionError>>;

export type CanExecuteTransaction = (args: ExecuteTransactionArgs) => boolean;

// ------------------------------------------------------------------------------------------------
// SignMessage

export type SignMessageArgs = { message: Message };
export type SignMessageOutput = SignedMessage;
type SignMessageError = unknown;

export type SafeSignMessage = (
  args: SignMessageArgs,
) => Promise<Result<SignMessageOutput, SignMessageError>>;

export type CanSignMessage = (args: SignMessageArgs) => boolean;

// ------------------------------------------------------------------------------------------------
// Sign Delegation

/**
 * A near-api-ts `DelegationIntent` whose `expiration` may be left out - then the signer picks
 * it. A signer that can't take an expiration, like a near-connect wallet, refuses an intent
 * that has one.
 */
export type SignDelegationIntent = Prettify<
  {
    receiverAccountId: AccountId;
    expiration?: DelegationIntent['expiration'];
  } & (SingleDelegableAction | MultiDelegableActions)
>;

export type SignDelegationArgs = { intent: SignDelegationIntent };

// TODO replace with SignedDelegation in the future
export type SignDelegationOutput = { signedDelegationBorsh64: string };

type SignDelegationError = unknown;

export type SafeSignDelegation = (
  args: SignDelegationArgs,
) => Promise<Result<SignDelegationOutput, SignDelegationError>>;

export type CanSignDelegation = (args: SignDelegationArgs) => boolean;

// ------------------------------------------------------------------------------------------------

export type ServiceId = string;

export type Signer<ServiceId extends string = string> = {
  serviceId: ServiceId;
  safeExecuteTransaction: SafeExecuteTransaction;
  canExecuteTransaction: CanExecuteTransaction;
  safeSignMessage: SafeSignMessage;
  canSignMessage: CanSignMessage;
  safeSignDelegation: SafeSignDelegation;
  canSignDelegation: CanSignDelegation;
};

export type Service<
  ServiceId extends string = string,
  ServiceBox extends Record<string, unknown> = Record<string, unknown>,
> = {
  serviceId: ServiceId;
  serviceBox: ServiceBox;
};

export type ServiceCreator<
  ServiceId extends string = string,
  ServiceBox extends Record<string, unknown> = Record<string, unknown>,
> = {
  serviceId: ServiceId;
  createService(args: { networkId: string }): Service<ServiceId, ServiceBox>;
  createSigner(args: {
    signerAccountId: AccountId;
    serviceBox: ServiceBox;
    client: Client;
  }): Signer<ServiceId>;
};
