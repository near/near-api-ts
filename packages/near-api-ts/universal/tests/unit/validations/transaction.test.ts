import { describe, expect, it } from 'vitest';
import { TransactionZodSchema } from '../../../src/transaction/signTransaction/transactionZodSchema';

const signerPublicKey = 'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44';
const recentBlockHash = 'EDhhHZrpcbJ4RrswFrcsPjww9oa6LTruF5Q4Hq2dXYwP';
const transfer = { actionType: 'Transfer', amount: { near: '1' } };

const signer = {
  accountId: 'bob',
  publicKey: signerPublicKey,
  replayProtection: { scheme: 'NonceChannel', nonce: 0 },
};

const base = {
  signer,
  receiverAccountId: 'alice',
  recentBlockHash,
};

const withReplayProtection = (replayProtection: Record<string, unknown>) => ({
  ...base,
  signer: { ...signer, replayProtection },
  action: transfer,
});

describe('TransactionZodSchema', () => {
  it('accepts a single-action transaction', () => {
    expect(TransactionZodSchema.safeParse({ ...base, action: transfer }).success).toBe(true);
  });

  it('accepts a multi-action transaction', () => {
    expect(TransactionZodSchema.safeParse({ ...base, actions: [transfer, transfer] }).success).toBe(
      true,
    );
  });

  it('rejects a transaction with neither action nor actions', () => {
    expect(TransactionZodSchema.safeParse({ ...base }).success).toBe(false);
  });

  it('rejects a transaction with both action and actions', () => {
    expect(
      TransactionZodSchema.safeParse({ ...base, action: transfer, actions: [transfer] }).success,
    ).toBe(false);
  });

  it('rejects a multi-action transaction with an empty actions array', () => {
    expect(TransactionZodSchema.safeParse({ ...base, actions: [] }).success).toBe(false);
  });

  it('rejects an invalid signer account id', () => {
    expect(
      TransactionZodSchema.safeParse({
        ...base,
        signer: { ...signer, accountId: 'Bob' },
        action: transfer,
      }).success,
    ).toBe(false);
  });

  it('rejects an invalid recentBlockHash', () => {
    expect(
      TransactionZodSchema.safeParse({ ...base, recentBlockHash: '!!!', action: transfer }).success,
    ).toBe(false);
  });

  it('rejects an unknown action type', () => {
    expect(
      TransactionZodSchema.safeParse({ ...base, action: { actionType: 'Nonexistent' } }).success,
    ).toBe(false);
  });
});

describe('TransactionZodSchema › signer.replayProtection', () => {
  it('defaults nonceProgression to Consecutive', () => {
    const nonceChannel = TransactionZodSchema.parse(
      withReplayProtection({ scheme: 'NonceChannel', nonce: 1 }),
    );
    const nonceChannels = TransactionZodSchema.parse(
      withReplayProtection({ scheme: 'NonceChannels', nonceChannelId: 3, nonce: 1 }),
    );

    expect(nonceChannel.signer.replayProtection.nonceProgression).toBe('Consecutive');
    expect(nonceChannels.signer.replayProtection.nonceProgression).toBe('Consecutive');
  });

  it('keeps an explicit nonceProgression', () => {
    const transaction = TransactionZodSchema.parse(
      withReplayProtection({ scheme: 'NonceChannel', nonce: 1, nonceProgression: 'Increasing' }),
    );

    expect(transaction.signer.replayProtection.nonceProgression).toBe('Increasing');
  });

  it('rejects an unknown nonceProgression', () => {
    expect(
      TransactionZodSchema.safeParse(
        withReplayProtection({ scheme: 'NonceChannel', nonce: 1, nonceProgression: 'Strict' }),
      ).success,
    ).toBe(false);
  });

  it('accepts nonce channel ids from 0 to 1023', () => {
    for (const nonceChannelId of [0, 1023])
      expect(
        TransactionZodSchema.safeParse(
          withReplayProtection({ scheme: 'NonceChannels', nonceChannelId, nonce: 1 }),
        ).success,
      ).toBe(true);
  });

  it('rejects a nonce channel id out of range', () => {
    for (const nonceChannelId of [-1, 1024, 1.5])
      expect(
        TransactionZodSchema.safeParse(
          withReplayProtection({ scheme: 'NonceChannels', nonceChannelId, nonce: 1 }),
        ).success,
      ).toBe(false);
  });

  it('rejects NonceChannels without a nonce channel id', () => {
    expect(
      TransactionZodSchema.safeParse(withReplayProtection({ scheme: 'NonceChannels', nonce: 1 }))
        .success,
    ).toBe(false);
  });

  // A stripped id would send the transaction without a channel - reject it instead.
  it('rejects a nonce channel id with the NonceChannel scheme', () => {
    expect(
      TransactionZodSchema.safeParse(
        withReplayProtection({ scheme: 'NonceChannel', nonceChannelId: 0, nonce: 1 }),
      ).success,
    ).toBe(false);
  });
});

describe('TransactionZodSchema › AddAccessKey action', () => {
  const withAction = (action: Record<string, unknown>) => ({ ...base, action });

  const fullAccessKey = {
    actionType: 'AddAccessKey',
    publicKey: signerPublicKey,
    permission: { kind: 'FullAccess' },
    gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
    replayProtection: { scheme: 'NonceChannel' },
  };

  const gasKey = {
    ...fullAccessKey,
    gasPayment: { source: 'KeyBalance' },
    replayProtection: { scheme: 'NonceChannels', channelCount: 4 },
  };

  it('accepts a key paid from the account balance and one paid from its own balance', () => {
    expect(TransactionZodSchema.safeParse(withAction(fullAccessKey)).success).toBe(true);
    expect(TransactionZodSchema.safeParse(withAction(gasKey)).success).toBe(true);
  });

  // The shape of the creator arguments - the action spells out what they leave implied
  it('rejects an action without its replay protection or allowance spelled out', () => {
    const { replayProtection: _, ...withoutReplayProtection } = fullAccessKey;

    expect(TransactionZodSchema.safeParse(withAction(withoutReplayProtection)).success).toBe(false);
    expect(
      TransactionZodSchema.safeParse(
        withAction({ ...fullAccessKey, gasPayment: { source: 'AccountBalance' } }),
      ).success,
    ).toBe(false);
  });

  // Nearcore has no allowance for a full access key; dropping it would add an unlimited key
  it('rejects a limited allowance on a FullAccess key', () => {
    expect(
      TransactionZodSchema.safeParse(
        withAction({
          ...fullAccessKey,
          gasPayment: { source: 'AccountBalance', allowance: { near: '1' } },
        }),
      ).success,
    ).toBe(false);
  });

  // A stripped count would add an ordinary key instead of the gas key the caller asked for
  it('rejects a channel count with the NonceChannel scheme', () => {
    expect(
      TransactionZodSchema.safeParse(
        withAction({
          ...fullAccessKey,
          replayProtection: { scheme: 'NonceChannel', channelCount: 4 },
        }),
      ).success,
    ).toBe(false);
  });

  it('rejects a replay protection scheme that does not match the gas payment', () => {
    expect(
      TransactionZodSchema.safeParse(
        withAction({ ...gasKey, replayProtection: { scheme: 'NonceChannel' } }),
      ).success,
    ).toBe(false);
    expect(
      TransactionZodSchema.safeParse(
        withAction({
          ...fullAccessKey,
          replayProtection: { scheme: 'NonceChannels', channelCount: 4 },
        }),
      ).success,
    ).toBe(false);
  });
});
