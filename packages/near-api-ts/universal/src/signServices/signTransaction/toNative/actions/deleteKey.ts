import type { NativeDeleteKeyAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/deleteKey';
import type { InnerDeleteKeyAction } from '../../zodSchemas/actions/deleteKey';
import { toNativePublicKey } from '../publicKey';

export const toNativeDeleteKeyAction = (action: InnerDeleteKeyAction): NativeDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNativePublicKey(action.publicKey),
  },
});
