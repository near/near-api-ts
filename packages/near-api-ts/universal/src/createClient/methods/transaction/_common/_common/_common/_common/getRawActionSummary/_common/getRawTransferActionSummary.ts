import type { TransferAction } from '@near-js/jsonrpc-types';
import { yoctoNear } from '../../../../../../../../../_common/nearToken';

export const getRawTransferActionSummary = ({ deposit }: TransferAction) => ({
  actionType: 'Transfer' as const,
  amount: yoctoNear(deposit),
});
