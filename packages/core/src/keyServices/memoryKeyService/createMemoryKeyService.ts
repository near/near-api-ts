import { createSignTransaction } from './createSignTransaction';
import { parseKeySources } from './parseKeySources';
import { createFindPrivateKey } from './createFindPrivateKey';
import type {
  Context,
  MemoryKeyService,
  CreateMemoryKeyServiceInput,
} from 'nat-types/keyServices/memoryKeyService';

export const createMemoryKeyService = async (
  params: CreateMemoryKeyServiceInput,
): Promise<MemoryKeyService> => {
  const context: Context = {
    keyPairs: parseKeySources(params),
  } as Context;

  context.findPrivateKey = createFindPrivateKey(context.keyPairs);

  return {
    signTransaction: createSignTransaction(context),
  };
};
