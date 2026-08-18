import type {
  NearcoreTransaction,
  NearcoreTransactionAction,
} from '../../../../../types/_common/transaction/transaction';
import { toNearcorePublicKey } from '../../../_common/_common/_common/toNearcore/publicKey';
import { toNearcoreAddKeyAction } from '../../../_common/_common/toNearcore/delegableActions/addKey';
import { toNearcoreCreateAccountAction } from '../../../_common/_common/toNearcore/delegableActions/createAccount';
import { toNearcoreDeleteAccountAction } from '../../../_common/_common/toNearcore/delegableActions/deleteAccount';
import { toNearcoreDeleteKeyAction } from '../../../_common/_common/toNearcore/delegableActions/deleteKey';
import { toNearcoreDeployContractAction } from '../../../_common/_common/toNearcore/delegableActions/deployContract';
import { toNearcoreFunctionCallAction } from '../../../_common/_common/toNearcore/delegableActions/functionCall';
import { toNearcoreStakeAction } from '../../../_common/_common/toNearcore/delegableActions/stake';
import { toNearcoreTransferAction } from '../../../_common/_common/toNearcore/delegableActions/transfer';
import type {
  InnerTransaction,
  InnerTransactionAction,
} from '../../../_common/zodSchemas/transaction/transaction';
import { toNearcoreExecuteDelegation } from './executeDelegation';

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
