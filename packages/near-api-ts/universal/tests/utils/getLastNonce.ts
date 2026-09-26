import type { AccountAccessKey } from '../../index';

// Tests sign with keys paid from the account balance, which track a single nonce sequence
export const getLastNonce = (accountAccessKey: AccountAccessKey) => {
  const { replayProtection } = accountAccessKey;

  if (replayProtection.scheme !== 'SingleNonceSequence')
    throw new Error(`Expected a key with a single nonce sequence, got ${replayProtection.scheme}`);

  return replayProtection.lastNonce;
};
