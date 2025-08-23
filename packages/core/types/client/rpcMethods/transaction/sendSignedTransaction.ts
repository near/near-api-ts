import type { SignedTransaction } from 'nat-types/signedTransaction';
import type { ClientContext } from 'nat-types/client/client';

type Input = {
  signedTransaction: SignedTransaction;
  options?: {
    waitUntil?: string; // TODO Fix!
  };
};

type Output = any;

export type SendSignedTransaction = (input: Input) => Promise<Output>;

export type CreateSendSignedTransaction = (
  clientContext: ClientContext,
) => SendSignedTransaction;
