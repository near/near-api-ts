import type {
  NearcoreAction,
  NearcoreTransaction,
} from '../../../../types/_common/transaction/transaction';
import type { InnerAction, InnerTransaction } from '../zodSchemas/transaction';
import { toNearcoreAddKeyAction } from './actions/addKey';
import { toNearcoreCreateAccountAction } from './actions/createAccount';
import { toNearcoreDeleteAccountAction } from './actions/deleteAccount';
import { toNearcoreDeleteKeyAction } from './actions/deleteKey';
import { toNearcoreDeployContractAction } from './actions/deployContract';
import { toNearcoreFunctionCallAction } from './actions/functionCall';
import { toNearcoreStakeAction } from './actions/stake';
import { toNearcoreTransferAction } from './actions/transfer';
import { toNearcorePublicKey } from './publicKey';

const toNearcoreAction = (action: InnerAction): NearcoreAction => {
  if (action.actionType === 'Transfer') return toNearcoreTransferAction(action);
  if (action.actionType === 'CreateAccount') return toNearcoreCreateAccountAction();
  if (action.actionType === 'AddKey') return toNearcoreAddKeyAction(action);
  if (action.actionType === 'DeployContract') return toNearcoreDeployContractAction(action);
  if (action.actionType === 'Stake') return toNearcoreStakeAction(action);
  if (action.actionType === 'FunctionCall') return toNearcoreFunctionCallAction(action);
  if (action.actionType === 'DeleteKey') return toNearcoreDeleteKeyAction(action);
  // the last action type could only be a DeleteAccount
  return toNearcoreDeleteAccountAction(action);
};

const toNearcoreActions = (
  actions: Pick<InnerTransaction, 'action' | 'actions'>,
): NearcoreAction[] => {
  if (actions.action) return [toNearcoreAction(actions.action)];
  if (actions.actions) return actions.actions.map((action) => toNearcoreAction(action));
  return [];
};

export const toNearcoreTransaction = (transaction: InnerTransaction): NearcoreTransaction => ({
  signerId: transaction.signerAccountId,
  publicKey: toNearcorePublicKey(transaction.signerPublicKey),
  actions: toNearcoreActions(transaction),
  receiverId: transaction.receiverAccountId,
  nonce: BigInt(transaction.nonce),
  blockHash: transaction.blockHash.cryptoHashU8,
});
