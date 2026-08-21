import type { NearcoreDeleteKeyAction } from '../../../../../types/_common/transaction/actions/delegableActions/deleteKey';
import { toNearcorePublicKey } from '../_common/toNearcore/toNearcorePublicKey';
import type { InnerDeleteKeyAction } from '../zodSchemas/deleteKey';

export const toNearcoreDeleteKeyAction = (
  action: InnerDeleteKeyAction,
): NearcoreDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNearcorePublicKey(action.publicKey),
  },
});
