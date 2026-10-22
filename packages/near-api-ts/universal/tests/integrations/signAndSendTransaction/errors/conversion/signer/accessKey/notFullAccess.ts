import { expect } from 'vitest';
import { transfer } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../signer.test';
import { attachContractFunctionCallKey } from './_common/attachContractFunctionCallKey';

export const notFullAccess = (context: TestContext) => async () => {
  const { client } = context;

  // A `ContractFunctionCall` key may only sign a single CallContractFunction action, so any other
  // action — a transfer here — demands a full access key.
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
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.AccessKey.NotFullAccess');
  expect(tx.error.context.info).toBe(null);
};
