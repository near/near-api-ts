import type { NativeDeleteKeyAction } from 'nat-types/actions/deleteKey';
import { toNativePublicKey } from '@common/transformers/toNative/publicKey';
import type { InnerDeleteKeyAction } from '@common/schemas/zod/transaction/actions/deleteKey';

export const toNativeDeleteKeyAction = (
  action: InnerDeleteKeyAction,
): NativeDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNativePublicKey(action.publicKey),
  },
});
