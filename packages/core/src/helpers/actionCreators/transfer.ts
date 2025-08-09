import type { TransferAction } from 'nat-types/actions/transfer';
import type { NearAmount } from 'nat-types/common';

type TransferInput = {
  amount: NearAmount;
};

export const transfer = ({ amount }: TransferInput): TransferAction => ({
  type: 'Transfer',
  params: {
    amount,
  },
});
