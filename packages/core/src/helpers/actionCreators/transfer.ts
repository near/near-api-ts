import type { TransferAction } from 'nat-types/transaction';

type TransferInput = {
  amount:
    | {
        yoctoNear: bigint | string;
      }
    | {
        near: bigint | string;
      };
};

export const transfer = ({ amount }: TransferInput): TransferAction => {
  // TODO do real parsing
  const yoctoNear =
    'yoctoNear' in amount ? BigInt(amount.yoctoNear) : BigInt(amount.near);

  return {
    type: 'Transfer',
    params: {
      amount: {
        yoctoNear,
      },
    },
  };
};
