import { expect } from 'vitest';
import { callContractFunction } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../signer.test';
import { attachContractFunctionCallKey } from './_common/attachContractFunctionCallKey';

export const receiverNotAllowed = (context: TestContext) => async () => {
  const { client } = context;

  // The key may only call `alice`, but the transaction is addressed to `bob`.
  const contractFunctionCallKeyPair = await attachContractFunctionCallKey(context, {
    allowedContract: 'alice',
    allowance: 'Unlimited',
    allowedFunctions: 'AllNonPayable',
  });

  const contractFunctionCallAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: contractFunctionCallKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: contractFunctionCallKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: contractFunctionCallKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(contractFunctionCallAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: contractFunctionCallAccessKey.atMomentOf.blockHash,
      action: callContractFunction({ functionName: 'any_function', gasLimit: { teraGas: '10' } }),
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
