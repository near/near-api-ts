import type { NearAmount } from 'nat-types/common';

export type TransferAction = {
  type: 'Transfer';
  params: {
    amount: NearAmount;
  };
};

export type NativeTransferAction = {
  transfer: {
    deposit: bigint;
  };
};
