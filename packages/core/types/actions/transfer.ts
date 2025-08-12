import type { NearOption } from 'nat-types/common';

export type TransferActionParams = {
  amount: NearOption;
};

export type TransferAction = {
  type: 'Transfer';
  params: TransferActionParams;
};

export type NativeTransferAction = {
  transfer: {
    deposit: bigint;
  };
};
