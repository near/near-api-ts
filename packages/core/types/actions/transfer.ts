import type { NearOption } from 'nat-types/common';

export type TransferActionParams = {
  amount: NearOption;
};

export type TransferAction = {
  actionType: 'Transfer';
  params: TransferActionParams;
};

// ****** NATIVE ********

export type NativeTransferAction = {
  transfer: {
    deposit: bigint;
  };
};
