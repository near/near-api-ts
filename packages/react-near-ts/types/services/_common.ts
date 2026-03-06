import type { TransactionIntent, AccountId, Client } from 'near-api-ts';

export type ServiceId = string;

export type Service<
  ServiceId extends string = string,
  ServiceBox extends Record<string, unknown> = Record<string, unknown>,
> = {
  serviceId: ServiceId;
  serviceBox: ServiceBox;
};

export type Signer<ServiceId extends string = string> = {
  serviceId: ServiceId;
  safeExecuteTransaction: (args: { intent: TransactionIntent }) => Promise<any>;
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
