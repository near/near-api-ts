import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { createAccount, deployContract, near, transfer } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getFileBytes } from '../../../../../utils/common';
import type { TestContext } from './executor.test';

export const storageDepositTooLow = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      actions: [
        createAccount(),
        // Far less than the ~0.84 NEAR the deployed contract needs for storage.
        transfer({ amount: near('0.1') }),
        deployContract({
          wasmBytes: await getFileBytes('./wasm/write-get-record.wasm'),
        }),
      ],
      receiverAccountId: 'new.nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  // TODO rework after rework SendSignedTransaction
  assertNatErrKind(tx, 'Client.SendSignedTransaction.Internal');
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    // @ts-ignore
    transactionHash: tx.error.context.cause.context.rpcResponse.result.transaction.hash,
  });

  assertTxResultExecutionErrKind(txResult, 'Executor.StorageDeposit.TooLow');
  expect(txResult.result.error.context.accountId).toBe('new.nat');
  expect(txResult.result.error.context.missingAmount.near).toBe('0.73734');
};
