import { expect } from 'vitest';
import { functionCall } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../action.test';

export const zeroGasLimit = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(natAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      // A function call with no gas could never do any work, so `validate_function_call_action`
      // rejects it before the method name and the arguments are even looked at.
      action: functionCall({ functionName: 'any_function', gasLimit: { gas: 0n } }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.FunctionCall.ZeroGasLimit');
  expect(tx.error.context.info).toBe(null);
};
