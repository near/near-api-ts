import { expect } from 'vitest';
import { functionCall, signDelegation } from '../../../../../../../index';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from '../executeDelegation.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';
import { sendDelegation } from './_common/sendDelegation';

export const functionNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // The key is restricted to `allowed_function`, but another function is delegated.
  const functionCallKeyPair = await attachFunctionCallKey(context, {
    contractAccountId: 'bob',
    gasBudget: 'Unlimited',
    allowedFunctions: ['allowed_function'],
  });

  const aliceAccessKey = await client.getAccountAccessKey({
    accountId: 'alice',
    publicKey: functionCallKeyPair.publicKey,
  });

  const signedDelegation = await signDelegation({
    delegation: {
      delegatorAccountId: 'alice',
      delegatorPublicKey: functionCallKeyPair.publicKey,
      delegatedAction: functionCall({
        functionName: 'forbidden_function',
        gasLimit: { teraGas: '10' },
      }),
      receiverAccountId: 'bob',
      nonce: aliceAccessKey.accountAccessKey.nonce + 1,
      expiration: { blockHeight: aliceAccessKey.blockHeight + 100 },
    },
    signDataProvider: functionCallKeyPair,
  });

  const { tx, transactionHash } = await sendDelegation(context, signedDelegation);

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Delegator.AccessKey.Function.NotAllowed',
  );

  const txResult = await client.getTransactionResult({ transactionHash });

  assertTxResultExecutionErrKind(
    txResult,
    'Action.ExecuteDelegation.Delegator.AccessKey.Function.NotAllowed',
  );
  expect(txResult.error.context).toStrictEqual({ functionName: 'forbidden_function' });
};
