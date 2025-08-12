import type { TransferAction } from 'nat-types/actions/transfer';
import type { NearOption } from 'nat-types/common';

type TransferInput = {
  amount: NearOption;
};

export const transfer = ({ amount }: TransferInput): TransferAction => ({
  type: 'Transfer',
  params: {
    amount,
  },
});
