import type { TransactionIntent, AccountId, Client } from 'near-api-ts';
import type { Result } from '../_common.ts';

export type ServiceId = string;

export type Service<
  ServiceId extends string = string,
  ServiceBox extends Record<string, unknown> = Record<string, unknown>,
> = {
  serviceId: ServiceId;
  serviceBox: ServiceBox;
};

type ExecuteTransactionOutput = {
  rawRpcResult: unknown;
};

export type Signer<ServiceId extends string = string> = {
  serviceId: ServiceId;
  safeExecuteTransaction: (args: {
    intent: TransactionIntent;
  }) => Promise<Result<ExecuteTransactionOutput, unknown>>;
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
