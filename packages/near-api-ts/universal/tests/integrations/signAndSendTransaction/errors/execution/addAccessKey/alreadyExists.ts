import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { addAccessKey } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './addAccessKey.test';

export const alreadyExists = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: getLastNonce(natAccessKey.accessKey) + 1,
      blockHash: natAccessKey.atMomentOf.blockHash,
      action: addAccessKey({
        publicKey: DEFAULT_PUBLIC_KEY,
        permission: {
          kind: 'FunctionCall',
          allowedContract: 'alice',
          allowedFunctions: 'AllNonPayable',
        },
        gasPayment: { source: 'AccountBalance', allowance: { near: '2.25' } },
      }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.AddAccessKey.AlreadyExists');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.AddAccessKey.AlreadyExists');
  expect(txResult.error.context).toStrictEqual({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });
};
