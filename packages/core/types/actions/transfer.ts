import type { NearOption } from 'nat-types/common';

export type TransferAction = {
  type: 'Transfer';
  params: {
    amount: NearOption;
  };
};

export type NativeTransferAction = {
  transfer: {
    deposit: bigint;
  };
};
