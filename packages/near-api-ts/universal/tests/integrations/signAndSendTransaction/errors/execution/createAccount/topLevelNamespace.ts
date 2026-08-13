import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { createAccount } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/signServices/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './createAccount.test';

export const topLevelNamespace = (context: TestContext) => async () => {
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
      receiverAccountId: 'top-level-account',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.CreateAccount.TopLevelNamespace');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });
  assertTxResultExecutionErrKind(txResult, 'Action.CreateAccount.TopLevelNamespace');

  expect(txResult.error.context).toStrictEqual({
    newAccountId: 'top-level-account',
    creatorAccountId: 'nat',
    registrarAccountId: 'registrar',
  });
};
