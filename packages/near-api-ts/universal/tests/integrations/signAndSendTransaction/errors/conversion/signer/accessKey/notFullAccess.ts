import { expect } from 'vitest';
import { transfer } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../signer.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';

export const notFullAccess = (context: TestContext) => async () => {
  const { client } = context;

  // A function-call key may only sign a single FunctionCall action, so any other
  // action — a transfer here — demands a full access key.
  const functionCallKeyPair = await attachFunctionCallKey(context, {
    contractAccountId: 'alice',
    gasBudget: 'Unlimited',
    allowedFunctions: 'AllNonPayable',
  });

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: functionCallKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: functionCallKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: functionCallKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.AccessKey.NotFullAccess');
  expect(tx.error.context.info).toBe(null);
};
