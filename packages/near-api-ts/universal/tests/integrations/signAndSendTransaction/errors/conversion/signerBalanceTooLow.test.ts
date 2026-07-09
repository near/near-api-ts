import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMemoryKeyService,
  type MemoryKeyService,
  transfer,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';
import { createDefaultClient, log } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';
import { testKeys } from '../../../../utils/testKeys';

describe('safeSendSignedTransaction › Transaction.Signer.Balance.TooLow', () => {
  let client: Client;
  let keyService: MemoryKeyService;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [
        { privateKey: DEFAULT_PRIVATE_KEY },
        { privateKey: testKeys.fc.forContract.privateKey },
      ],
    });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Signer.Balance.TooLow when the signer cannot cover the transfer', async () => {
    const { blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await signTransaction({
      signDataProvider: keyService,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: 1,
        blockHash,
        action: transfer({ amount: { near: '10005' } }),
        receiverAccountId: 'bob',
      },
    });

    const res = await client.safeSendSignedTransaction(signedTransaction);
    log(res);

    assertNatErrKind(res, 'Client.SendSignedTransaction.Rpc.Transaction.Signer.Balance.TooLow');
  });
});
