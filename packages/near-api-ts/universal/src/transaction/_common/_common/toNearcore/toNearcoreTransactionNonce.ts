import type { NearcoreTransactionNonce } from '../../../../../types/_common/transaction/transaction';

type ReplayProtection =
  | { scheme: 'NonceChannel'; nonce: number }
  | { scheme: 'NonceChannels'; nonceChannelId: number; nonce: number };

// A nonce channel id is nearcore's nonce index, passed through as is: both start at 0.
export const toNearcoreTransactionNonce = (
  replayProtection: ReplayProtection,
): NearcoreTransactionNonce =>
  replayProtection.scheme === 'NonceChannel'
    ? { nonce: { nonce: BigInt(replayProtection.nonce) } }
    : {
        gasKeyNonce: {
          nonce: BigInt(replayProtection.nonce),
          nonceIndex: replayProtection.nonceChannelId,
        },
      };
