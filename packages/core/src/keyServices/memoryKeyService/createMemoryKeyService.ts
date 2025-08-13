import { createSignTransaction } from './signTransaction';
import type {
  Context,
  MemoryKeyService,
  CreateMemoryKeyServiceInput,
} from 'nat-types/keyServices/memoryKeyService';
import { parseKeySources } from './parseKeySources';
import type { PublicKey } from 'nat-types/crypto';

const createFindPrivateKey =
  (keyPairs: Context['keyPairs']) => (publicKey: PublicKey) => {
    const privateKey = keyPairs[publicKey]?.privateKey;
    if (privateKey) return privateKey;
    throw new Error(
      `Cannot find a corresponding private key for '${publicKey}'`,
    );
  };

export const createMemoryKeyService = async (
  params: CreateMemoryKeyServiceInput,
): Promise<MemoryKeyService> => {
  const keyPairs = parseKeySources(params);
  const findPrivateKey = createFindPrivateKey(keyPairs);

  const context: Context = {
    keyPairs,
    findPrivateKey,
  };

  return {
    signTransaction: createSignTransaction(context),
  };
};
