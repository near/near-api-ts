import type { NativeDeleteKeyAction } from '../../../../../types/_common/transaction/actions/deleteKey';
import type { InnerDeleteKeyAction } from '../../../schemas/zod/transaction/actions/deleteKey';
import { toNativePublicKey } from '../publicKey';

export const toNativeDeleteKeyAction = (
  action: InnerDeleteKeyAction,
): NativeDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNativePublicKey(action.publicKey),
  },
});
