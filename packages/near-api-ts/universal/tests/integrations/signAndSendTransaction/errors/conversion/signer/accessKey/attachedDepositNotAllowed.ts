import { expect } from 'vitest';
import { functionCall } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../signer.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';

export const attachedDepositNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // A function-call key can never attach a deposit, even to a function it is allowed
  // to call on the account it is allowed to call.
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
      action: functionCall({
        functionName: 'any_function',
        gasLimit: { teraGas: '10' },
        attachedDeposit: { yoctoNear: '1' },
      }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Signer.AccessKey.AttachedDeposit.NotAllowed',
  );
  expect(tx.error.context.info).toBe(null);
};
