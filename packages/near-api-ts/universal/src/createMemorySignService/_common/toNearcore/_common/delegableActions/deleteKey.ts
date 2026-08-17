import type { NearcoreDeleteKeyAction } from '../../../../../../types/_common/transaction/actions/delegableActions/deleteKey';
import type { InnerDeleteKeyAction } from '../../../zodSchemas/transaction/_common/delegableActions/deleteKey';
import { toNearcorePublicKey } from '../_common/publicKey';

export const toNearcoreDeleteKeyAction = (
  action: InnerDeleteKeyAction,
): NearcoreDeleteKeyAction => ({
  deleteKey: {
    publicKey: toNearcorePublicKey(action.publicKey),
  },
});
