import type { PublicKey, NativePublicKey } from 'nat-types/crypto';

export type DeleteKeyActionParams = {
  publicKey: PublicKey;
};

export type DeleteKeyAction = {
  type: 'DeleteKey';
  params: DeleteKeyActionParams;
};

export type NativeDeleteKeyAction = {
  deleteKey: {
    publicKey: NativePublicKey;
  };
};
