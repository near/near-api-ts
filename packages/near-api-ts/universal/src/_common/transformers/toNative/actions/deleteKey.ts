import type { NativeDeleteKeyAction } from '../../../../../types/actions/deleteKey';
import { toNativePublicKey } from '../publicKey';
import type { InnerDeleteKeyAction } from '../../../schemas/zod/transaction/actions/deleteKey';

export const toNativeDeleteKeyAction = (
  action: InnerDeleteKeyAction,
): NativeDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNativePublicKey(action.publicKey),
  },
});
