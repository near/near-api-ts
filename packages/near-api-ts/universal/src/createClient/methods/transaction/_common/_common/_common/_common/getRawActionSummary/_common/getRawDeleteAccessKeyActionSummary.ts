import type { DeleteKeyAction } from '@near-js/jsonrpc-types';
import type { PublicKey } from '../../../../../../../../../../types/_common/crypto';

export const getRawDeleteAccessKeyActionSummary = ({ publicKey }: DeleteKeyAction) => ({
  actionType: 'DeleteAccessKey' as const,
  publicKey: publicKey as PublicKey, // TODO validate key by zod
});
