import { beforeAll, describe, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  createAccount,
  type Client,
  type MemoryKeyService,
} from '../../../../../src';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { testKeys } from '../../../../utils/testKeys';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';

vi.setConfig({ testTimeout: 60000 });

describe('Execute transaction', () => {
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

  it('Account Already Exists', async () => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await keyService.signTransaction({
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        action: createAccount(),
        receiverAccountId: 'bob',
      },
    });

    const res = await client.safeSendSignedTransaction({
      signedTransaction,
    });

    assertNatErrKind(
      res,
      'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist',
    );
  });
});
