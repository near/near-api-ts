import type {
  DeleteKeyAction,
  NativeDeleteKeyAction,
} from 'nat-types/actions/deleteKey';
import { toNativePublicKey } from '@common/transformers/toNative/publicKey';

export const toNativeDeleteKeyAction = (
  action: DeleteKeyAction,
): NativeDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNativePublicKey(action.params.publicKey),
  },
});
