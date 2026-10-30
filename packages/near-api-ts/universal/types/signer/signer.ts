import type { AccountId } from '../_common/common';
import type { SignService } from '../_common/signService';
import type { CreateSignerPublicErrorRegistry } from './createSigner';
import type { KeyPool, KeyPoolInnerErrorRegistry } from './inner/keyPool';
import type { Tasker } from './inner/tasker';
import type { TaskQueue, TaskQueueInnerErrorRegistry } from './inner/taskQueue';
import type {
  ExecuteTransaction,
  ExecuteTransactionPublicErrorRegistry,
  SafeExecuteTransaction,
} from './public/createExecuteTransaction';
import type {
  SafeSignTransactionIntent,
  SignTransactionIntent,
  SignTransactionPublicErrorRegistry,
} from './public/createSignTransaction';
import type { SignerClient } from './signerClient';

export interface SignerInnerErrorRegistry
  extends KeyPoolInnerErrorRegistry,
    TaskQueueInnerErrorRegistry {}

export interface SignerPublicErrorRegistry
  extends CreateSignerPublicErrorRegistry,
    ExecuteTransactionPublicErrorRegistry,
    SignTransactionPublicErrorRegistry {}

export type SignerContext = {
  signerAccountId: AccountId;
  client: SignerClient;
  signService: SignService;
  taskQueue: TaskQueue;
  keyPool: KeyPool;
  tasker: Tasker;
};

/**
 * `S` and `C` are the sign service and the client the signer was created with, so
 * `signService` and `client` keep their own methods - the vault of a VaultSignService,
 * or every method of a Client, for one.
 */
export type Signer<S extends SignService = SignService, C extends SignerClient = SignerClient> = {
  signerAccountId: AccountId;
  client: C;
  signService: S;
  signTransaction: SignTransactionIntent; // TODO remove Intent from public type
  executeTransaction: ExecuteTransaction;
  safeSignTransaction: SafeSignTransactionIntent;
  safeExecuteTransaction: SafeExecuteTransaction;
};
