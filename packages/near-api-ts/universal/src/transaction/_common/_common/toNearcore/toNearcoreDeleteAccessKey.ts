import type { NearcoreDeleteAccessKeyAction } from '../../../../../types/_common/transaction/actions/delegableActions/deleteAccessKey';
import { toNearcorePublicKey } from '../_common/toNearcorePublicKey';
import type { InnerDeleteAccessKeyAction } from '../zodSchemas/deleteAccessKey';

export const toNearcoreDeleteAccessKeyAction = (
  action: InnerDeleteAccessKeyAction,
): NearcoreDeleteAccessKeyAction => ({
  deleteKey: {
    publicKey: toNearcorePublicKey(action.publicKey),
  },
});
