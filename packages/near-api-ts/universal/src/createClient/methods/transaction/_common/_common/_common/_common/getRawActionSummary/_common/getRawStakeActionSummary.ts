import type { StakeAction } from '@near-js/jsonrpc-types';
import type { PublicKey } from '../../../../../../../../../../types/_common/crypto';
import { yoctoNear } from '../../../../../../../../../_common/nearToken';

export const getRawStakeActionSummary = ({ stake, publicKey }: StakeAction) => ({
  actionType: 'Stake' as const,
  amount: yoctoNear(stake),
  validatorPublicKey: publicKey as PublicKey, // TODO validate key by zod
});
