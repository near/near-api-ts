import { describe, expect, it } from 'vitest';
import { TransactionZodSchema } from '../../../src/_common/schemas/zod/transaction/transaction';

const signerPublicKey = 'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44';
const blockHash = 'EDhhHZrpcbJ4RrswFrcsPjww9oa6LTruF5Q4Hq2dXYwP';
const transfer = { actionType: 'Transfer', amount: { near: '1' } };

const base = {
  signerAccountId: 'bob',
  signerPublicKey,
  receiverAccountId: 'alice',
  nonce: 0,
  blockHash,
};

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

  it('rejects an invalid signerAccountId', () => {
    expect(
      TransactionZodSchema.safeParse({ ...base, signerAccountId: 'Bob', action: transfer }).success,
    ).toBe(false);
  });

  it('rejects an invalid blockHash', () => {
    expect(
      TransactionZodSchema.safeParse({ ...base, blockHash: '!!!', action: transfer }).success,
    ).toBe(false);
  });

  it('rejects an unknown action type', () => {
    expect(
      TransactionZodSchema.safeParse({ ...base, action: { actionType: 'Nonexistent' } }).success,
    ).toBe(false);
  });
});
