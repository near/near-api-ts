import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import { transactionBorshSchema } from '../schemas/borsh';
import { fromCurveString } from './curveString';
import type { PublicKey } from 'nat-types/crypto';
import type { BorshBytes } from 'nat-types/common';
import type { Transaction, Action, TransferAction } from 'nat-types/transaction';

const getBorshTransferAction = (action: TransferAction) => ({
  transfer: {
    deposit: action.params.amount.yoctoNear,
  },
});

const toBorshAction = (action: Action) => {
  if (action.type === 'Transfer') return getBorshTransferAction(action);
};

const getBorshActions = ({ action, actions = [] }: Transaction) => {
  if (action) return [toBorshAction(action)];
  return actions.map((action) => toBorshAction(action));
};

const getBorshPublicKey = (publicKey: PublicKey) => {
  const { curve, u8Data } = fromCurveString(publicKey);
  return { [`${curve}Key`]: { data: u8Data } };
};

export const toTransactionBorshObject = (transaction: Transaction) => ({
  signerId: transaction.signerAccountId,
  publicKey: getBorshPublicKey(transaction.signerPublicKey),
  actions: getBorshActions(transaction),
  receiverId: transaction.receiverAccountId,
  nonce: BigInt(transaction.nonce),
  blockHash: base58.decode(transaction.blockHash),
});

export const toBorshTransaction = (transaction: Transaction): BorshBytes =>
  serialize(transactionBorshSchema, toTransactionBorshObject(transaction));
