import type {
  TransferAction,
  TransferActionParams,
} from 'nat-types/actions/transfer';

export const transfer = (params: TransferActionParams): TransferAction => ({
  actionType: 'Transfer',
  params,
});
