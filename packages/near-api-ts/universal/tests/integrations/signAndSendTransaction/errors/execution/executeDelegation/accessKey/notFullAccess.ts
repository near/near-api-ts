import { expect } from 'vitest';
import { signDelegation, transfer } from '../../../../../../../index';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../executeDelegation.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';
import { sendDelegation } from './_common/sendDelegation';

export const notFullAccess = (context: TestContext) => async () => {
  const { client } = context;

  // A function-call key may only delegate a single FunctionCall action, so any other action —
  // a transfer here — demands a full access key.
  const functionCallKeyPair = await attachFunctionCallKey(context, {
    allowedContract: 'bob',
    allowance: 'Unlimited',
    allowedFunctions: 'AllNonPayable',
  });

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: functionCallKeyPair.publicKey,
  });

  const signedDelegation = await signDelegation({
    delegation: {
      delegatorAccountId: 'alice',
      delegatorPublicKey: functionCallKeyPair.publicKey,
      delegatedAction: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
      nonce: getLastNonce(aliceAccessKey.accessKey) + 1,
      expiration: { blockHeight: aliceAccessKey.atMomentOf.blockHeight + 100 },
    },
    signDataProvider: functionCallKeyPair,
  });

  const { tx, transactionHash } = await sendDelegation(context, signedDelegation);

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Delegator.AccessKey.NotFullAccess',
  );

  const txResult = await client.getTransactionResult({ transactionHash });

  assertTxResultExecutionErrKind(
    txResult,
    'Action.ExecuteDelegation.Delegator.AccessKey.NotFullAccess',
  );
  expect(txResult.error.context).toBe(null);
};
