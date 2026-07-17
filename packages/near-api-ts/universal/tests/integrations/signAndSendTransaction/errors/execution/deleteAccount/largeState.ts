import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { addFullAccessKey, deleteAccount, randomSecp256k1KeyPair } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './deleteAccount.test';

export const largeState = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'alice',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  // 1. Create a large state with more than 10_000 bytes
  const actions = Array.from({ length: 100 }, () => addFullAccessKey(randomSecp256k1KeyPair()));

  const signedTx1 = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'alice',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      actions,
      receiverAccountId: 'alice',
    },
  });

  await client.safeSendSignedTransaction({ signedTransaction: signedTx1 });
  await safeSleep(500);

  // 2. Try to delete an account
  const signedDeleteAccountTx = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'alice',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: accountAccessKey.nonce + 2,
      blockHash,
      action: deleteAccount({ beneficiaryAccountId: 'nat' }),
      receiverAccountId: 'alice',
    },
  });

  await client.safeSendSignedTransaction({ signedTransaction: signedDeleteAccountTx });
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedDeleteAccountTx.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.DeleteAccount.LargeState');
  expect(txResult.result.error.context.accountId).toBe('alice');
};
