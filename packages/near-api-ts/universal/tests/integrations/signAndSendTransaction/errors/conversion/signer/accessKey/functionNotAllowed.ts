import { expect } from 'vitest';
import { functionCall } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../signer.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';

export const functionNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // The key is restricted to `allowed_function`, but another function is called.
  const functionCallKeyPair = await attachFunctionCallKey(context, {
    contractAccountId: 'alice',
    gasBudget: 'Unlimited',
    allowedFunctions: ['allowed_function'],
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
      action: functionCall({
        functionName: 'forbidden_function',
        gasLimit: { teraGas: '10' },
      }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.AccessKey.Function.NotAllowed');
  expect(tx.error.context.info).toStrictEqual({ functionName: 'forbidden_function' });
};
