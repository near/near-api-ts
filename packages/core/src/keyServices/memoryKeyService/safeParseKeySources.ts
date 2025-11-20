import { getPublicKey } from '../../helpers/crypto/getPublicKey';
import type {
  KeyPairs,
  KeySource,
  CreateMemoryKeyServiceArgs,
  KeyPair,
} from 'nat-types/keyServices/memoryKeyService';
import type { Result } from 'nat-types/common';
import { result } from '@common/utils/result';

const parseKeySource = (keySource: KeySource): KeyPair => {
  // TODO validate

  return {
    publicKey: getPublicKey(keySource.privateKey),
    privateKey: keySource.privateKey,
  };
};

export const safeParseKeySources = (
  args: CreateMemoryKeyServiceArgs,
): Result<KeyPairs, unknown> => {
  if (args.keySource) {
    const { publicKey, privateKey } = parseKeySource(args.keySource);
    return result.ok({ [publicKey]: privateKey });
  }

  if (args.keySources) // or 0
    return result.ok(
      Object.fromEntries(
        args.keySources.map((keySource) => {
          const { publicKey, privateKey } = parseKeySource(keySource);
          return [publicKey, privateKey];
        }),
      ),
    );

  return result.err(
    new Error('Cannot create MemoryKeyService - no private keys were found'),
  );
};
