import { expect } from 'vitest';
import { functionCall } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../signer.test';
import { attachFunctionCallKey } from './_common/attachFunctionCallKey';

export const attachedDepositNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // A function-call key can never attach a deposit, even to a function it is allowed
  // to call on the account it is allowed to call.
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
