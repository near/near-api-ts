import { expect } from 'vitest';
import { signDelegation, transfer } from '../../../../../../../index';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../executeDelegation.test';
import { attachContractFunctionCallKey } from './_common/attachContractFunctionCallKey';
import { sendDelegation } from './_common/sendDelegation';

export const notFullAccess = (context: TestContext) => async () => {
  const { client } = context;

  // A `ContractFunctionCall` key may only delegate a single CallContractFunction action, so any
  // other action — a transfer here — demands a full access key.
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
      delegatedAction: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
      expiration: { blockHeight: aliceAccessKey.atMomentOf.blockHeight + 100 },
    },
    signDataProvider: contractFunctionCallKeyPair,
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
