import { expect } from 'vitest';
import { transfer } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../signer.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';

export const notFullAccess = (context: TestContext) => async () => {
  const { client } = context;

  // A function-call key may only sign a single FunctionCall action, so any other
  // action — a transfer here — demands a full access key.
  const functionCallKeyPair = await attachFunctionCallKey(context, {
    allowedContract: 'alice',
    allowance: 'Unlimited',
    allowedFunctions: 'AllNonPayable',
  });

  const functionCallAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: functionCallKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: functionCallKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: functionCallKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(functionCallAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: functionCallAccessKey.atMomentOf.blockHash,
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.AccessKey.NotFullAccess');
  expect(tx.error.context.info).toBe(null);
};
