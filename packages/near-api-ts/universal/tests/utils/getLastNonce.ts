import type { AccessKey } from '../../index';

// Tests sign with keys paid from the account balance, which keep a single nonce channel
export const getLastNonce = (accessKey: AccessKey) => {
  const { replayProtection } = accessKey;

  if (replayProtection.scheme !== 'NonceChannel')
    throw new Error(`Expected a key with a single nonce channel, got ${replayProtection.scheme}`);

  return replayProtection.lastNonce;
};
