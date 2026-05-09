import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { describe, it } from 'vitest';
import {
  createMainnetClient,
  createMemoryKeyService,
  createMemorySigner,
  createTestnetClient,
} from '../../index';
import { SignedTransactionZodSchema } from '../../src/_common/schemas/zod/transaction/transaction';
import { toBorshSignedTransaction } from '../../src/_common/transformers/toBorshBytes/transaction';
import { log } from '../utils/common';

describe('Get Detailed Transaction', () => {
  it('Test', async () => {
    const client = createTestnetClient();

    const keyService = createMemoryKeyService({
      keySources: [{ privateKey: 'ed25519:4YaD3FFiwdizkS9fhvK22CvYtse6YUKQisbJ9WRrfKhj6Pn239icTLu63tBvLwRV6jzWTjT45kwB2EbKrqCsYgDL' }],
    });

    const lantstool = createMemorySigner({
      signerAccountId: 'lantstool.testnet',
      keyService,
      client,
    });

    const signedTx = await lantstool.signTransaction({
      intent: {
        action: {
          actionType: 'Transfer',
          amount: { yoctoNear: '164' }
        },
        receiverAccountId: 'eclipseer.testnet'
      }
    });

    const txBorsh64 = toBorshSignedTransaction(SignedTransactionZodSchema.parse(signedTx)).toBase64()

    log(txBorsh64)
  });
});



