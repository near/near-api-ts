import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import type { CreateGetBlock } from 'nat-types/client/block/getBlock';

export const createGetBlock: CreateGetBlock =
  ({ sendRequest }) =>
  ({ blockReference } = {}) =>
    sendRequest({
      body: {
        method: 'block',
        params: toNativeBlockReference(blockReference),
      },
    });
