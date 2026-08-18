import type { NearcorePublicKey } from '../../../../../../types/_common/crypto';
import type { InnerPublicKey } from '../../../../../_common/zodSchemas/publicKey';

export const toNearcorePublicKey = ({ publicKeyU8, curve }: InnerPublicKey): NearcorePublicKey => {
  switch (curve) {
    case 'ed25519':
      return { ed25519Key: { data: publicKeyU8 } };
    case 'secp256k1':
      return { secp256k1Key: { data: publicKeyU8 } };
    case 'ml-dsa-65':
      return { mlDsa65Key: { data: publicKeyU8 } };
  }
};
