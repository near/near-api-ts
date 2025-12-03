import { describe, it } from 'vitest';
import { TransactionSchema } from '@common/schemas/zod/transaction/transaction';

const publicKey = 'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44';

const transaction = {
  signerAccountId: 'bob',
  signerPublicKey: publicKey,
  action: {
    actionType: 'Transfer',
    amount: { near: '1' },
  },
  receiverAccountId: 'alice',
  nonce: 0,
  blockHash: 'EDhhHZrpcbJ4RrswFrcsPjww9oa6LTruF5Q4Hq2dXYwP',
};

describe('Transaction', () => {
  it('Ok', () => {
    const res = TransactionSchema.safeParse(transaction);
    console.log(res);
  });
});
