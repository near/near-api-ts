import { createSignTransaction } from './signTransaction';
import type {
  KeySource,
  Context,
  MemoryKeyService,
} from 'nat-types/keyServices/memoryKeyService';
import { parseKeySources } from './parseKeySources';

type InputArgs = {
  keySources: KeySource[];
};

export const createMemoryKeyService = async ({
  keySources,
}: InputArgs): Promise<MemoryKeyService> => {
  const context: Context = {
    keyPairs: parseKeySources(keySources),
  };
  return {
    signTransaction: createSignTransaction(context),
  };
};
