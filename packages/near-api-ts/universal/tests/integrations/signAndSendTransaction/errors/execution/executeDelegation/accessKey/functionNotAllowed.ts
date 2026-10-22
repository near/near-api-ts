import { expect } from 'vitest';
import { callContractFunction, signDelegation } from '../../../../../../../index';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../executeDelegation.test';
import { attachContractFunctionCallKey } from './_common/attachContractFunctionCallKey';
import { sendDelegation } from './_common/sendDelegation';

export const functionNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // The key is restricted to `allowed_function`, but another function is delegated.
  const contractFunctionCallKeyPair = await attachContractFunctionCallKey(context, {
    allowedContract: 'bob',
    allowance: 'Unlimited',
    allowedFunctions: ['allowed_function'],
  });

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: contractFunctionCallKeyPair.publicKey,
  });

  const signedDelegation = await signDelegation({
    delegation: {
      delegator: {
        accountId: 'alice',
        publicKey: contractFunctionCallKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(aliceAccessKey.accessKey) + 1,
        },
      },
      delegatedAction: callContractFunction({
        functionName: 'forbidden_function',
        gasLimit: { teraGas: '10' },
      }),
      receiverAccountId: 'bob',
      expiration: { blockHeight: aliceAccessKey.atMomentOf.blockHeight + 100 },
    },
    signDataProvider: contractFunctionCallKeyPair,
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
