import type {
  DeleteKeyAction,
  NativeDeleteKeyAction,
} from 'nat-types/actions/deleteKey';
import { toNativePublicKey } from '@common/transformers/borsh/toNativePublicKey';

export const deleteKey = (action: DeleteKeyAction): NativeDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNativePublicKey(action.params.publicKey),
  },
});
