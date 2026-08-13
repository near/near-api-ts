import type { NearcoreDeleteKeyAction } from '../../../../../types/_common/transaction/actions/nonDelegateActions/deleteKey';
import type { InnerDeleteKeyAction } from '../../zodSchemas/actions/deleteKey';
import { toNearcorePublicKey } from '../publicKey';

export const toNearcoreDeleteKeyAction = (
  action: InnerDeleteKeyAction,
): NearcoreDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNearcorePublicKey(action.publicKey),
  },
});
