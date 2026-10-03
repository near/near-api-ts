import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { near, randomEd25519KeyPair, stake } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './stake.test';

export const validatorStakeAlreadyZero = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

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
      action: stake({
        amount: near('0'),
        validatorPublicKey: randomEd25519KeyPair().publicKey,
      }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.Stake.ValidatorStake.AlreadyZero');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.Stake.ValidatorStake.AlreadyZero');
  expect(txResult.error.context).toStrictEqual({ accountId: 'nat' });
};
