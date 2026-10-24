import type { TransferToGasKeyAction } from '@near-js/jsonrpc-types';
import type { PublicKey } from '../../../../../../../../../../types/_common/crypto';
import { yoctoNear } from '../../../../../../../../../_common/nearToken';

export const getRawTopUpAccessKeyBalanceActionSummary = ({
  publicKey,
  deposit,
}: TransferToGasKeyAction) => ({
  actionType: 'TopUpAccessKeyBalance' as const,
  publicKey: publicKey as PublicKey, // TODO validate key by zod
  amount: yoctoNear(deposit),
});
