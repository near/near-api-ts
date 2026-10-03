import { describe, expect, it } from 'vitest';
import { createMemoryKeyService, randomEd25519KeyPair } from '../../../../index';
import {
  safeSignTransaction,
  signTransaction,
} from '../../../../src/transaction/signTransaction/signTransaction';
import type { Transaction } from '../../../../types/_common/transaction/transaction';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

const privateKey =
  'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6';
const publicKey = 'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44';

const transaction: Transaction = {
  signer: {
    accountId: 'bob',
    publicKey,
    replayProtection: { scheme: 'NonceChannel', nonce: 0 },
  },
  action: {
    actionType: 'Transfer',
    amount: { near: '1' },
  },
  receiverAccountId: 'alice',
  recentBlockHash: 'EDhhHZrpcbJ4RrswFrcsPjww9oa6LTruF5Q4Hq2dXYwP',
};

describe('memoryKeyService.signTransaction', () => {
  it('signs a transaction and returns hash and signature', async () => {
    const keyService = createMemoryKeyService({ keySource: { privateKey } });
    const res = await signTransaction({ signDataProvider: keyService, transaction });

    expect(res.transactionHash).toBe('HhxcQZDTWRsDV61vkH9zz94FSC8Fe8at3M4XCrgUQMrT');
    expect(res.signedTransaction.signature).toBe(
      'ed25519:2bFTZ2tkmM86weuzsUhWwJ8J2U4g3RKzjZG7eDQ36zEXmoJ8fe9z9Pv2Ug58VH5uhZ4kEZuFEqeCQXoJk1SPNfNd',
    );
  });

  it('fails with SigningKey.NotFound when no key matches the signer', async () => {
    const keyService = createMemoryKeyService({ keySource: { privateKey } });

    const res = await safeSignTransaction({
      signDataProvider: keyService,
      transaction: {
        ...transaction,
        signer: { ...transaction.signer, publicKey: randomEd25519KeyPair().publicKey },
      },
    });

    assertNatErrKind(res, 'SignTransaction.SignData.Failed');
  });
});
