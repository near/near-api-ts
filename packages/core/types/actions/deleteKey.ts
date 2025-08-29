import type { PublicKey, NativePublicKey } from 'nat-types/crypto';

export type DeleteKeyActionParams = {
  publicKey: PublicKey;
};

export type DeleteKeyAction = {
  actionType: 'DeleteKey';
  params: DeleteKeyActionParams;
};

// ****** NATIVE ********

export type NativeDeleteKeyAction = {
  deleteKey: {
    publicKey: NativePublicKey;
  };
};
