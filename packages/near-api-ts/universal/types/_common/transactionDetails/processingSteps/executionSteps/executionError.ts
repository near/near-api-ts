import type { Prettify } from '../../../../utils';
import type { AccountId, CryptoHash } from '../../../common';

interface CreateAccountErrorRegistry {
  'CreateAccount.AlreadyExist': {
    accountId: AccountId;
  };
}

export interface ExecutionErrorRegistry extends CreateAccountErrorRegistry {
  X: { a: number };
  Y: { b: number };
}

export type ExecutionErrorKind = keyof ExecutionErrorRegistry;

export type ExecutionError<K extends ExecutionErrorKind = ExecutionErrorKind> = K extends K
  ? { kind: K; context: { executionStepIndex: number } & ExecutionErrorRegistry[K] }
  : never;

// export type ExecutionError = {
//   [K in ExecutionErrorKind]: {
//     kind: K;
//     context: Prettify<{ executionStepIndex: number } & ExecutionErrorRegistry[K]>;
//   };
// }[ExecutionErrorKind];
