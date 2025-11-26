import type {NearTokenArgs} from 'nat-types/_common/nearToken';

export type CreateTransferActionArgs = {
  amount: NearTokenArgs;
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
