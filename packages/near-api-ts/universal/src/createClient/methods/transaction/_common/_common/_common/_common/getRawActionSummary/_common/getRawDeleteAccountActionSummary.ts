import type { DeleteAccountAction } from '@near-js/jsonrpc-types';

export const getRawDeleteAccountActionSummary = ({ beneficiaryId }: DeleteAccountAction) => ({
  actionType: 'DeleteAccount' as const,
  beneficiaryAccountId: beneficiaryId,
});
