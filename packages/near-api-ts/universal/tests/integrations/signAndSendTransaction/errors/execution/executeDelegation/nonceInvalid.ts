import { expect } from 'vitest';
import { executeDelegation, signDelegation, transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './executeDelegation.test';

export const nonceInvalid = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });
  const delegationNonce = getLastNonce(aliceAccessKey.accessKey);

  const signedDelegation = await signDelegation({
    delegation: {
      delegator: {
        accountId: 'alice',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: { scheme: 'NonceChannel', nonce: delegationNonce },
      },
      delegatedAction: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
      expiration: { blockHeight: aliceAccessKey.atMomentOf.blockHeight + 100 },
    },
    signDataProvider: defaultKeyPair,
  });

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(natAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      action: executeDelegation(signedDelegation),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Nonce.Invalid');

  const txResult = await client.getTransactionResult(signedTransaction);

  assertTxResultExecutionErrKind(txResult, 'Action.ExecuteDelegation.Nonce.Invalid');
  expect(txResult.error.context).toStrictEqual({
    delegationNonce,
    accessKeyNonce: getLastNonce(aliceAccessKey.accessKey),
  });
};
