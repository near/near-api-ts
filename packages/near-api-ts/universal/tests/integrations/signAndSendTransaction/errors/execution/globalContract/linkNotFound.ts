import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { linkGlobalContract } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './globalContract.test';

export const linkNotFound = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;
  const globalContractAccountId = 'alice';

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
      action: linkGlobalContract({ globalContractAccountId }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.LinkGlobalContract.GlobalContract.NotFound',
  );

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.LinkGlobalContract.GlobalContract.NotFound');
  expect(txResult.error.context).toStrictEqual({ globalContractAccountId });
};
