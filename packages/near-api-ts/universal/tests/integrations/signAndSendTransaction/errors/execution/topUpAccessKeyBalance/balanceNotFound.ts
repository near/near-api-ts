import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { near, topUpAccessKeyBalance } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './topUpAccessKeyBalance.test';

// `nat`'s genesis key exists, but it pays for gas from the account balance - nearcore reports it the
// same way as a key that does not exist at all. `alice` tops it up, so the receipt is not local.
export const balanceNotFound = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const {
    accessKey,
    atMomentOf: { blockHash },
  } = await client.getAccessKey({
    accountId: 'alice',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'alice',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: getLastNonce(accessKey) + 1,
      blockHash,
      action: topUpAccessKeyBalance({ publicKey: DEFAULT_PUBLIC_KEY, amount: near('1') }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.TopUpAccessKeyBalance.Balance.NotFound',
  );

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.TopUpAccessKeyBalance.Balance.NotFound');
  expect(txResult.error.context).toStrictEqual({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });
};
