import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMainnetClient,
  createMemoryKeyService,
  createMemorySigner,
  createTestnetClient,
} from '../../index';
import { SignedTransactionZodSchema } from '../../src/_common/schemas/zod/transaction/transaction';
import { toBorshSignedTransaction } from '../../src/_common/transformers/toBorshBytes/transaction';
import { createDefaultClient, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

describe('conversionStepError', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Test', async () => {
    const keyService = createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });

    const lantstool = createMemorySigner({
      signerAccountId: 'lantstool.testnet',
      keyService,
      client,
    });

    const signedTx = await lantstool.signTransaction({
      intent: {
        action: {
          actionType: 'Transfer',
          amount: { yoctoNear: '164' },
        },
        receiverAccountId: 'eclipseer.testnet',
      },
    });

    const txBorsh64 = toBorshSignedTransaction(
      SignedTransactionZodSchema.parse(signedTx),
    ).toBase64();

    log(txBorsh64);
  });
});
