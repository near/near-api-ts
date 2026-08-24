import { expect } from 'vitest';
import { functionCall, signDelegation } from '../../../../../../../index';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from '../executeDelegation.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';
import { sendDelegation } from './_common/sendDelegation';

export const receiverNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // The key may only call `bob`, but the delegated call is addressed to `nat`. The receiver the
  // key restricts is the delegation receiver, not the relayer transaction's one.
  const functionCallKeyPair = await attachFunctionCallKey(context, {
    contractAccountId: 'bob',
    gasBudget: 'Unlimited',
    allowedFunctions: 'AllNonPayable',
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
        functionName: 'any_function',
        gasLimit: { teraGas: '10' },
      }),
      receiverAccountId: 'nat',
      nonce: aliceAccessKey.accountAccessKey.nonce + 1,
      expiration: { blockHeight: aliceAccessKey.blockHeight + 100 },
    },
    signDataProvider: functionCallKeyPair,
  });

  const { tx, transactionHash } = await sendDelegation(context, signedDelegation);

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Delegator.AccessKey.Receiver.NotAllowed',
  );

  const txResult = await client.getTransactionResult({ transactionHash });

  assertTxResultExecutionErrKind(
    txResult,
    'Action.ExecuteDelegation.Delegator.AccessKey.Receiver.NotAllowed',
  );
  expect(txResult.error.context).toStrictEqual({
    delegationReceiverAccountId: 'nat',
    allowedContractAccountId: 'bob',
  });
};
