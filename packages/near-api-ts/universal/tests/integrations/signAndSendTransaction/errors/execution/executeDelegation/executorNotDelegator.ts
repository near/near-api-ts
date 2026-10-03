import { expect } from 'vitest';
import { executeDelegation, signDelegation, transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './executeDelegation.test';

export const executorNotDelegator = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedDelegation = await signDelegation({
    delegation: {
      delegator: {
        accountId: 'alice',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(aliceAccessKey.accessKey) + 1,
        },
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
      // The delegation must be sent to the delegator ('alice'), not to the account
      // the delegated action targets.
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Executor.NotAllowed',
  );

  const txResult = await client.getTransactionResult(signedTransaction);

  assertTxResultExecutionErrKind(txResult, 'Action.ExecuteDelegation.Executor.NotAllowed');
  expect(txResult.error.context.executorAccountId).toBe('bob');
  expect(txResult.error.context.delegatorAccountId).toBe('alice');
};
