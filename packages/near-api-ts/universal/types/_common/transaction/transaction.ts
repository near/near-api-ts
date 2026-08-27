import type { Prettify } from '../../utils';
import type { AccountId, BlockHash, TransactionNonce } from '../common';
import type { NearcorePublicKey, NearcoreSignature, PublicKey, Signature } from '../crypto';
import type {
  AddFullAccessKeyAction,
  AddFunctionCallKeyAction,
  NearcoreAddKeyAction,
} from './actions/delegableActions/addKey';
import type {
  CreateAccountAction,
  NearcoreCreateAccountAction,
} from './actions/delegableActions/createAccount';
import type {
  DeleteAccountAction,
  NearcoreDeleteAccountAction,
} from './actions/delegableActions/deleteAccount';
import type {
  DeleteKeyAction,
  NearcoreDeleteKeyAction,
} from './actions/delegableActions/deleteKey';
import type {
  DeployContractAction,
  NearcoreDeployContractAction,
} from './actions/delegableActions/deployContract';
import type {
  FunctionCallAction,
  NearcoreFunctionCallAction,
} from './actions/delegableActions/functionCall';
import type {
  LinkGlobalContractAction,
  NearcoreLinkGlobalContractAction,
} from './actions/delegableActions/linkGlobalContract';
import type {
  NearcorePinGlobalContractAction,
  PinGlobalContractAction,
} from './actions/delegableActions/pinGlobalContract';
import type {
  NearcoreRegisterGlobalContractAction,
  RegisterGlobalContractAction,
} from './actions/delegableActions/registerGlobalContract';
import type { NearcoreStakeAction, StakeAction } from './actions/delegableActions/stake';
import type { NearcoreTransferAction, TransferAction } from './actions/delegableActions/transfer';
import type {
  ExecuteDelegationAction,
  NearcoreExecuteDelegationAction,
} from './actions/executeDelegation/executeDelegation';

export type TransactionAction =
  | CreateAccountAction
  | TransferAction
  | AddFullAccessKeyAction
  | AddFunctionCallKeyAction
  | DeployContractAction
  | FunctionCallAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction
  | ExecuteDelegationAction
  | RegisterGlobalContractAction
  | LinkGlobalContractAction
  | PinGlobalContractAction;

type SingleTransactionAction = { action: TransactionAction; actions?: never };
type MultiTransactionActions = { action?: never; actions: TransactionAction[] };

type TransactionBase = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  receiverAccountId: AccountId;
  nonce: TransactionNonce;
  blockHash: BlockHash;
};

export type Transaction = TransactionBase & (SingleTransactionAction | MultiTransactionActions);

export type TransactionIntent = Prettify<
  {
    receiverAccountId: AccountId;
  } & (SingleTransactionAction | MultiTransactionActions)
>;

export type SignedTransaction = {
  transaction: TransactionBase & MultiTransactionActions;
  signature: Signature;
};

// Nearcore Transaction
export type NearcoreTransactionAction =
  | NearcoreCreateAccountAction
  | NearcoreTransferAction
  | NearcoreAddKeyAction
  | NearcoreDeployContractAction
  | NearcoreFunctionCallAction
  | NearcoreStakeAction
  | NearcoreDeleteKeyAction
  | NearcoreDeleteAccountAction
  | NearcoreExecuteDelegationAction
  | NearcoreRegisterGlobalContractAction
  | NearcoreLinkGlobalContractAction
  | NearcorePinGlobalContractAction;

export type NearcoreTransaction = {
  signerId: AccountId;
  publicKey: NearcorePublicKey;
  actions: NearcoreTransactionAction[];
  receiverId: AccountId;
  nonce: bigint;
  blockHash: Uint8Array;
};

export type NearcoreSignedTransaction = {
  transaction: NearcoreTransaction;
  signature: NearcoreSignature;
};
