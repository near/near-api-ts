import { expect } from 'vitest';
import { executeDelegation, signDelegation, transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from './executeDelegation.test';

const ACCESS_KEY_NONCE_RANGE_MULTIPLIER = 1_000_000;

export const nonceTooLarge = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const aliceAccessKey = await client.getAccountAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });
  const delegationNonce = (aliceAccessKey.blockHeight + 100) * ACCESS_KEY_NONCE_RANGE_MULTIPLIER;

  const signedDelegation = await signDelegation({
    delegation: {
      delegatorAccountId: 'alice',
      delegatorPublicKey: defaultKeyPair.publicKey,
      delegatedAction: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
      nonce: delegationNonce,
      expiration: { blockHeight: aliceAccessKey.blockHeight + 100 },
    },
    signDataProvider: defaultKeyPair,
  });

  const natAccessKey = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: natAccessKey.accountAccessKey.nonce + 1,
      blockHash: natAccessKey.blockHash,
      action: executeDelegation({ signedDelegation }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Nonce.TooLarge');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.ExecuteDelegation.Nonce.TooLarge');
  expect(txResult.error.context.delegationNonce).toBe(delegationNonce);
  expect(txResult.error.context.maxAllowedNonce).toBeLessThan(delegationNonce);
};
