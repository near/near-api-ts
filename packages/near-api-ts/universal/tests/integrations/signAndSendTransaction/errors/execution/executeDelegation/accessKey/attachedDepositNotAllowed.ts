import { expect } from 'vitest';
import { callContractFunction, signDelegation } from '../../../../../../../index';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../executeDelegation.test';
import { attachContractFunctionCallKey } from './_common/attachContractFunctionCallKey';
import { sendDelegation } from './_common/sendDelegation';

export const attachedDepositNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // A `ContractFunctionCall` key can never attach a deposit, even to a function it is allowed to
  // call on the account it is allowed to call.
  const contractFunctionCallKeyPair = await attachContractFunctionCallKey(context, {
    allowedContract: 'bob',
    allowance: 'Unlimited',
    allowedFunctions: 'AllNonPayable',
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
        replayProtection: { nonce: getLastNonce(aliceAccessKey.accessKey) + 1 },
      },
      delegatedAction: callContractFunction({
        functionName: 'any_function',
        gasLimit: { teraGas: '10' },
        attachedDeposit: { yoctoNear: '1' },
      }),
      receiverAccountId: 'bob',
      expiration: { blockHeight: aliceAccessKey.atMomentOf.blockHeight + 100 },
    },
    signDataProvider: contractFunctionCallKeyPair,
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
