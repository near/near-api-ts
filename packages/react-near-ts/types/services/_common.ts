import type { TransactionIntent, AccountId, Client, PublicKey, Signature } from 'near-api-ts';
import type { Result } from '../_common.ts';

export type ServiceId = string;

export type Service<
  ServiceId extends string = string,
  ServiceBox extends Record<string, unknown> = Record<string, unknown>,
> = {
  serviceId: ServiceId;
  serviceBox: ServiceBox;
};

// ExecuteTransaction
export type ExecuteTransactionArgs = {
  intent: TransactionIntent;
};

export type ExecuteTransactionOutput = {
  rawRpcResult: unknown;
};

export type SafeExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<Result<ExecuteTransactionOutput, unknown>>;

// SignMessage
export type SignMessageArgs = {
  message: {
    data: string;
    recipient: string;
    nonce: Uint8Array;
  };
};

// type SignMessageOutput = {
//   accountId: AccountId;
//   publicKey: PublicKey;
//   signature: Signature;
// };

export type SignMessageOutput = {
  accountId: string;
  publicKey: string;
  signature: string;
};

export type SafeSignMessage = (
  args: SignMessageArgs,
) => Promise<Result<SignMessageOutput, unknown>>;

export type Signer<ServiceId extends string = string> = {
  serviceId: ServiceId;
  safeExecuteTransaction: SafeExecuteTransaction;
  safeSignMessage: SafeSignMessage;
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
