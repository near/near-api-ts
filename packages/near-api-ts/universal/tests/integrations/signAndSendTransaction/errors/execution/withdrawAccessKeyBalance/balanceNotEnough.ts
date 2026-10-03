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

export const balanceNotEnough = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;
  const gasKeyPair = randomEd25519KeyPair();

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: DEFAULT_PUBLIC_KEY,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(natAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      actions: [
        addAccessKey({
          publicKey: gasKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount: 1 },
        }),
        topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('1') }),
        withdrawAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('1.5') }),
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
    'Client.SendSignedTransaction.Rpc.Action.WithdrawAccessKeyBalance.Balance.NotEnough',
  );

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.WithdrawAccessKeyBalance.Balance.NotEnough');
  expect(txResult.error.context).toMatchObject({
    accountId: 'nat',
    publicKey: gasKeyPair.publicKey,
    keyBalance: { near: '1' },
    withdrawalAmount: { near: '1.5' },
    excessAmount: { near: '0.5' },
  });
};
