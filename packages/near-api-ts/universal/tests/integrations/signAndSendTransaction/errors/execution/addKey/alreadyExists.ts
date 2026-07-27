import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { addFunctionCallKey } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './addKey.test';

export const alreadyExists = (context: TestContext) => async () => {
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
      action: addFunctionCallKey({
        publicKey: DEFAULT_PUBLIC_KEY,
        contractAccountId: 'alice',
        gasBudget: { near: '2.25' },
        allowedFunctions: 'AllNonPayable',
      }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.AddKey.AlreadyExists');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.AddKey.AlreadyExists');
  expect(txResult.error.context).toStrictEqual({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });
};
