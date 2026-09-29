import { executeDelegation, signDelegation, transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './executeDelegation.test';

export const expired = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedDelegation = await signDelegation({
    delegation: {
      delegatorAccountId: 'alice',
      delegatorPublicKey: defaultKeyPair.publicKey,
      delegatedAction: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
      nonce: getLastNonce(aliceAccessKey.accessKey) + 1,
      expiration: { blockHeight: aliceAccessKey.atMomentOf.blockHeight - 1 },
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
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(natAccessKey.accessKey) + 1,
      blockHash: natAccessKey.atMomentOf.blockHash,
      action: executeDelegation(signedDelegation),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Expired');

  const txResult = await client.getTransactionResult(signedTransaction);

  assertTxResultExecutionErrKind(txResult, 'Action.ExecuteDelegation.Expired');
};
