import type { AccountId } from '../_common/common';
import type { SignService } from '../_common/signService';
import type { Client } from '../client/client';
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

export interface SignerInnerErrorRegistry
  extends KeyPoolInnerErrorRegistry,
    TaskQueueInnerErrorRegistry {}

export interface SignerPublicErrorRegistry
  extends CreateSignerPublicErrorRegistry,
    ExecuteTransactionPublicErrorRegistry,
    SignTransactionPublicErrorRegistry {}

export type SignerContext = {
  signerAccountId: AccountId;
  client: Client;
  signService: SignService;
  taskQueue: TaskQueue;
  keyPool: KeyPool;
  tasker: Tasker;
};

/**
 * `S` is the sign service the signer was created with, so `signService` keeps its own
 * methods - the vault of a VaultSignService, for one.
 */
// NextFeature: add policies
export type Signer<S extends SignService = SignService> = {
  signerAccountId: AccountId;
  client: Client;
  signService: S;
  signTransaction: SignTransactionIntent; // TODO remove Intent from public type
  executeTransaction: ExecuteTransaction;
  safeSignTransaction: SafeSignTransactionIntent;
  safeExecuteTransaction: SafeExecuteTransaction;
};
