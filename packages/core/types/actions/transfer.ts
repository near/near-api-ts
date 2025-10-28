import type { NearOption } from 'nat-types/common';

export type CreateTransferActionArgs = {
  amount: NearOption;
};

export type TransferAction = {
  actionType: 'Transfer';
} & CreateTransferActionArgs;

// ****** NATIVE ********

export type NativeTransferAction = {
  transfer: {
    deposit: bigint;
  };
};
