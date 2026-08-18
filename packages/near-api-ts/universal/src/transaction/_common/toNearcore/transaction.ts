import type {
  NearcoreTransaction,
  NearcoreTransactionAction,
} from '../../../../types/_common/transaction/transaction';
import type {
  InnerTransaction,
  InnerTransactionAction,
} from '../zodSchemas/transaction/transaction';
import { toNearcorePublicKey } from './_common/_common/publicKey';
import { toNearcoreAddKeyAction } from './_common/delegableActions/addKey';
import { toNearcoreCreateAccountAction } from './_common/delegableActions/createAccount';
import { toNearcoreDeleteAccountAction } from './_common/delegableActions/deleteAccount';
import { toNearcoreDeleteKeyAction } from './_common/delegableActions/deleteKey';
import { toNearcoreDeployContractAction } from './_common/delegableActions/deployContract';
import { toNearcoreFunctionCallAction } from './_common/delegableActions/functionCall';
import { toNearcoreStakeAction } from './_common/delegableActions/stake';
import { toNearcoreTransferAction } from './_common/delegableActions/transfer';
import { toNearcoreExecuteDelegation } from './executeDelegation/executeDelegation';

const toNearcoreTransactionAction = (action: InnerTransactionAction): NearcoreTransactionAction => {
  switch (action.actionType) {
    case 'CreateAccount':
      return toNearcoreCreateAccountAction();
    case 'AddKey':
      return toNearcoreAddKeyAction(action);
    case 'Transfer':
      return toNearcoreTransferAction(action);
    case 'DeployContract':
      return toNearcoreDeployContractAction(action);
    case 'FunctionCall':
      return toNearcoreFunctionCallAction(action);
    case 'Stake':
      return toNearcoreStakeAction(action);
    case 'DeleteKey':
      return toNearcoreDeleteKeyAction(action);
    case 'DeleteAccount':
      return toNearcoreDeleteAccountAction(action);
    case 'ExecuteDelegation':
      return toNearcoreExecuteDelegation(action);
  }
};

const toNearcoreTransactionActions = (
  actions: Pick<InnerTransaction, 'action' | 'actions'>,
): NearcoreTransactionAction[] => {
  if (actions.action) return [toNearcoreTransactionAction(actions.action)];
  if (actions.actions) return actions.actions.map((action) => toNearcoreTransactionAction(action));
  return [];
};

export const toNearcoreTransaction = (transaction: InnerTransaction): NearcoreTransaction => ({
  signerId: transaction.signerAccountId,
  publicKey: toNearcorePublicKey(transaction.signerPublicKey),
  actions: toNearcoreTransactionActions(transaction),
  receiverId: transaction.receiverAccountId,
  nonce: BigInt(transaction.nonce),
  blockHash: transaction.blockHash.cryptoHashU8,
});
