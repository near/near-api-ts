import type { PublicKey, NativePublicKey } from 'nat-types/crypto';

export type CreateDeleteKeyActionArgs = {
  publicKey: PublicKey;
};

export type DeleteKeyAction = {
  actionType: 'DeleteKey';
} & CreateDeleteKeyActionArgs;

// ****** NATIVE ********

export type NativeDeleteKeyAction = {
  deleteKey: {
    publicKey: NativePublicKey;
  };
};
