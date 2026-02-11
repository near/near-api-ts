import { beforeAll, describe, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  transfer,
  type Client,
  type MemoryKeyService,
} from '../../../../../index';
import { createDefaultClient, log } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { testKeys } from '../../../../utils/testKeys';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';

vi.setConfig({ testTimeout: 60000 });

describe('Invalid signature', () => {
  let client: Client;
  let keyService: MemoryKeyService;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = await createDefaultClient(sandbox);
    keyService = await createMemoryKeyService({
      keySources: [
        { privateKey: DEFAULT_PRIVATE_KEY },
        { privateKey: testKeys.fc.forContract.privateKey },
      ],
    });
    return () => sandbox.stop();
  });

  it('invalid signature', async () => {
    const { blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await keyService.signTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: 1,
        blockHash,
        action: transfer({ amount: { near: '100' } }),
        receiverAccountId: 'bob',
      },
    });

    const res = await client.safeSendSignedTransaction({
      signedTransaction: {
        ...signedTransaction,
        signature:
          'ed25519:4nhGVzRVDF1orVnfhQB4rG7ZqEhahUJQpuzvpMKe1dH6JMksAXbdQk1JzuwmNfzdtbL8PGDNx3c9BJFbZ4Guc3T4',
      },
    });
    log(res);

    assertNatErrKind(
      res,
      'Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid',
    );
  });
});
