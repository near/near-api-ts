import type {
  NearcoreTransaction,
  NearcoreTransactionAction,
} from '../../../../types/_common/transaction/transaction';
import { toNearcorePublicKey } from '../../_common/_common/_common/toNearcore/toNearcorePublicKey';
import { toNearcoreAddKeyAction } from '../../_common/_common/toNearcore/toNearcoreAddKey';
import { toNearcoreCreateAccountAction } from '../../_common/_common/toNearcore/toNearcoreCreateAccount';
import { toNearcoreDeleteAccountAction } from '../../_common/_common/toNearcore/toNearcoreDeleteAccount';
import { toNearcoreDeleteKeyAction } from '../../_common/_common/toNearcore/toNearcoreDeleteKey';
import { toNearcoreDeployContractAction } from '../../_common/_common/toNearcore/toNearcoreDeployContract';
import { toNearcoreFunctionCallAction } from '../../_common/_common/toNearcore/toNearcoreFunctionCall';
import { toNearcoreStakeAction } from '../../_common/_common/toNearcore/toNearcoreStake';
import { toNearcoreTransferAction } from '../../_common/_common/toNearcore/toNearcoreTransfer';
import type {
  InnerTransaction,
  InnerTransactionAction,
} from '../zodSchemas/transaction/transaction';
import { toNearcoreExecuteDelegation } from './toNearcoreExecuteDelegation';

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
