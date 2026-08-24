import { expect } from 'vitest';
import { randomEd25519KeyPair, signDelegation, transfer } from '../../../../../../../index';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from '../executeDelegation.test';
import { sendDelegation } from './_common/sendDelegation';

export const notFound = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  // The delegation is signed with a key `alice` never added, so it is signed consistently with
  // the public key it declares - the node only fails it when it looks the key up.
  const unknownKeyPair = randomEd25519KeyPair();

  const aliceAccessKey = await client.getAccountAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedDelegation = await signDelegation({
    delegation: {
      delegatorAccountId: 'alice',
      delegatorPublicKey: unknownKeyPair.publicKey,
      delegatedAction: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
      nonce: aliceAccessKey.accountAccessKey.nonce + 1,
      expiration: { blockHeight: aliceAccessKey.blockHeight + 100 },
    },
    signDataProvider: unknownKeyPair,
  });

  const { tx, transactionHash } = await sendDelegation(context, signedDelegation);

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Delegator.AccessKey.NotFound',
  );

  const txResult = await client.getTransactionResult({ transactionHash });

  assertTxResultExecutionErrKind(txResult, 'Action.ExecuteDelegation.Delegator.AccessKey.NotFound');
  expect(txResult.error.context).toStrictEqual({
    delegatorAccountId: 'alice',
    delegatorPublicKey: unknownKeyPair.publicKey,
  });
};
