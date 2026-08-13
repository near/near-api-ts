import { expect } from 'vitest';
import { functionCall } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/createMemorySignService/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../signer.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';

export const receiverNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // The key may only call `alice`, but the transaction is addressed to `bob`.
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
      action: functionCall({ functionName: 'any_function', gasLimit: { teraGas: '10' } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.AccessKey.Receiver.NotAllowed');
  expect(tx.error.context.info).toStrictEqual({
    transactionReceiverAccountId: 'bob',
    allowedContractAccountId: 'alice',
  });
};
