import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { createAccount } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './createAccount.test';

export const implicitAccount = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

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
      receiverAccountId: '8a3a2af86f8b2a0d013761565dc6ee86af153f6fa4c7db4bd9a52f63ff072d4c',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.CreateAccount.ImplicitAccount');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.CreateAccount.ImplicitAccount');

  expect(txResult.error.context).toStrictEqual({
    newAccountId: '8a3a2af86f8b2a0d013761565dc6ee86af153f6fa4c7db4bd9a52f63ff072d4c',
  });
};
