import type { Transaction } from '@universal/types/_common/transaction/transaction';
import { describe, expect, it } from 'vitest';
import { createMemoryKeyService, randomEd25519KeyPair } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

const privateKey =
  'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6';
const publicKey = 'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44';

const transaction: Transaction = {
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

describe('KeyService', () => {
  it('SignTransaction.Ok', async () => {
    const keyService = await createMemoryKeyService({
      keySource: { privateKey },
    });

    const res = await keyService.signTransaction({ transaction });

    expect(res.transactionHash).toBe(
      'HFdRehqc88853UQQZtFibmPAn77i9X64SwvxVSJjFpAa',
    );
    expect(res.signature).toBe(
      'ed25519:4j3z7rpKJLeyugziu8oKE9wZJBWXoakhdSUHRt8PHK5wuAdUkyuf3T36tMDF8RrWoiF5MG8Mc3PuAaqcpGAJtFAd',
    );
  });

  it('MemoryKeyService.SignTransaction.SigningKeyPair.NotFound', async () => {
    const keyService = await createMemoryKeyService({
      keySource: { privateKey },
    });

    const res = await keyService.safeSignTransaction({
      transaction: {
        ...transaction,
        signerPublicKey: randomEd25519KeyPair().publicKey,
      },
    });

    assertNatErrKind(
      res,
      'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound',
    );
  });
});
