import type {
  TransferAction,
  CreateTransferActionArgs,
} from 'nat-types/actions/transfer';

export const transfer = (args: CreateTransferActionArgs): TransferAction => ({
  ...args,
  actionType: 'Transfer',
});
