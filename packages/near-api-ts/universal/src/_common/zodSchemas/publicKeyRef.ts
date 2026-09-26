import { base58 } from '@scure/base';
import * as z from 'zod/mini';
import type { PublicKeyRef } from '../../../types/_common/crypto';
import { BinaryLengths } from '../_common/_common/constants';

const { Ed25519, Secp256k1, MlDsa65 } = BinaryLengths;

// The output stays a string: the schema also validates refs inside raw RPC results
export const PublicKeyRefZodSchema = z
  .pipe(
    z
      .string()
      .check(
        z.regex(
          /^(ed25519|secp256k1|ml-dsa-65-hash):[1-9A-HJ-NP-Za-km-z]+$/,
          `Public key refs should use the ed25519:<base58String>, ` +
            `secp256k1:<base58String> or ml-dsa-65-hash:<base58String> format.`,
        ),
      ),
    z.transform((publicKeyRef: PublicKeyRef) => publicKeyRef),
  )
  .check(
    z.refine(
      (publicKeyRef) => {
        const [kind, dataBase58] = publicKeyRef.split(':');
        const dataU8 = base58.decode(dataBase58);

        switch (kind) {
          case 'ed25519':
            return dataU8.length === Ed25519.PublicKeyRef;
          case 'secp256k1':
            return dataU8.length === Secp256k1.PublicKeyRef;
          case 'ml-dsa-65-hash':
            return dataU8.length === MlDsa65.PublicKeyRef;
          default:
            return false;
        }
      },
      { error: 'Invalid binary public key ref length' },
    ),
  );
