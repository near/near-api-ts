import type {
  TransferAction,
  TransferActionParams,
} from 'nat-types/actions/transfer';

export const transfer = (params: TransferActionParams): TransferAction => ({
  type: 'Transfer',
  params,
});
