import { expect } from 'vitest';
import { functionCall, signDelegation } from '../../../../../../../index';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from '../executeDelegation.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';
import { sendDelegation } from './_common/sendDelegation';

export const attachedDepositNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // A function-call key can never attach a deposit, even to a function it is allowed to call on
  // the account it is allowed to call.
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
        attachedDeposit: { yoctoNear: '1' },
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
    'Client.SendSignedTransaction.Rpc.Action.ExecuteDelegation.Delegator.AccessKey.AttachedDeposit.NotAllowed',
  );

  const txResult = await client.getTransactionResult({ transactionHash });

  assertTxResultExecutionErrKind(
    txResult,
    'Action.ExecuteDelegation.Delegator.AccessKey.AttachedDeposit.NotAllowed',
  );
  expect(txResult.error.context).toBe(null);
};
