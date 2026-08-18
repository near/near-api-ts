import type { NearcoreDeleteKeyAction } from '../../../../../../types/_common/transaction/actions/delegableActions/deleteKey';
import type { InnerDeleteKeyAction } from '../../../_common/_common/zodSchemas/delegableActions/deleteKey';
import { toNearcorePublicKey } from '../_common/publicKey';

export const toNearcoreDeleteKeyAction = (
  action: InnerDeleteKeyAction,
): NearcoreDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNearcorePublicKey(action.publicKey),
  },
});
