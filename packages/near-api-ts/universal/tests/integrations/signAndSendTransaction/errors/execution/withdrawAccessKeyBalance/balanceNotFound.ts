import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import {
  addAccessKey,
  near,
  randomEd25519KeyPair,
  topUpAccessKeyBalance,
  withdrawAccessKeyBalance,
} from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './withdrawAccessKeyBalance.test';

// Nearcore answers a top-up and a withdrawal with the same error, so the failed action is found by
// the error index - the top-up in front of the withdrawal must not be the one blamed.
export const balanceNotFound = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;
  const gasKeyPair = randomEd25519KeyPair();
  const missingKeyPair = randomEd25519KeyPair();

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: getLastNonce(natAccessKey.accessKey) + 1,
      blockHash: natAccessKey.atMomentOf.blockHash,
      actions: [
        addAccessKey({
          publicKey: gasKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount: 1 },
        }),
        topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('1') }),
        withdrawAccessKeyBalance({ publicKey: missingKeyPair.publicKey, amount: near('1') }),
      ],
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.WithdrawAccessKeyBalance.Balance.NotFound',
  );

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.WithdrawAccessKeyBalance.Balance.NotFound');
  expect(txResult.error.context).toStrictEqual({
    accountId: 'nat',
    publicKey: missingKeyPair.publicKey,
  });
};
