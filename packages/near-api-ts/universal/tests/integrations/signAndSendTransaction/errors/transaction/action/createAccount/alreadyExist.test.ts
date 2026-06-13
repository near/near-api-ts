import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { type Client, createAccount, keyPair } from '../../../../../../../index';
import { safeSleep } from '../../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { createDefaultClient, log } from '../../../../../../utils/common';
import { startSandbox } from '../../../../../../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60000 });

describe('safeSendSignedTransaction › Transaction.Action.CreateAccount.AlreadyExist', () => {
  let client: Client;
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.CreateAccount.AlreadyExist when creating an existing account', async () => {
    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        action: createAccount(),
        receiverAccountId: 'bob',
      },
    });

    const tx = await client.safeSendSignedTransaction({
      signedTransaction,
    });

    assertNatErrKind(
      tx,
      'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist',
    );

    await safeSleep(500);

    const txResult = await client.getTransactionResult({
      transactionHash: tx.error.context.transactionHash
    })
    log(txResult)

    // expect(tx).toBeTypeOf('string');
  });
});
