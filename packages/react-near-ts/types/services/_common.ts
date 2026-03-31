import type {
  AccountId,
  Client,
  DelegationIntent,
  Message,
  SignedMessage,
  TransactionIntent,
} from 'near-api-ts';
import type { Result } from '../_common.ts';

// ------------------------------------------------------------------------------------------------
// ExecuteTransaction

export type ExecuteTransactionArgs = { intent: TransactionIntent };
export type ExecuteTransactionOutput = { rawRpcResult: unknown };
type ExecuteTransactionError = unknown;

export type SafeExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<Result<ExecuteTransactionOutput, ExecuteTransactionError>>;

// ------------------------------------------------------------------------------------------------
// SignMessage

export type SignMessageArgs = { message: Message };
export type SignMessageOutput = SignedMessage;
type SignMessageError = unknown;

export type SafeSignMessage = (
  args: SignMessageArgs,
) => Promise<Result<SignMessageOutput, SignMessageError>>;

// ------------------------------------------------------------------------------------------------
// Sign Delegation

export type SignDelegationArgs = { intent: DelegationIntent };

// TODO replace with SignedDelegation in the future
export type SignDelegationOutput = { borsh64SignedDelegation: string };

type SignDelegationError = unknown;

export type SafeSignDelegation = (
  args: SignDelegationArgs,
) => Promise<Result<SignDelegationOutput, SignDelegationError>>;

// ------------------------------------------------------------------------------------------------

export type ServiceId = string;

export type Signer<ServiceId extends string = string> = {
  serviceId: ServiceId;
  safeExecuteTransaction: SafeExecuteTransaction;
  safeSignMessage: SafeSignMessage;
  safeSignDelegation: SafeSignDelegation;
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
  createService(): Service<ServiceId, ServiceBox>;
  createSigner(args: {
    signerAccountId: AccountId;
    serviceBox: ServiceBox;
    client: Client;
  }): Signer<ServiceId>;
};
