import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { createAccount, deployContract, near, transfer } from '../../../../../../index';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getFileBytes } from '../../../../../utils/common';
import type { TestContext } from './general.test';

/**
 * Reproduces ActionErrorKind::LackBalanceForState (the action-level variant produced in a
 * receipt at runtime/runtime/src/lib.rs, NOT the tx-validation InvalidTxError variant).
 *
 * We create a fresh sub-account, fund it with a tiny amount, and deploy an ~83 KB contract
 * in the same receipt. Every action succeeds, but the post-execution check_storage_stake on
 * the new account fails because the deposited balance can't cover the contract's storage
 * (~0.84 NEAR at the default storage_amount_per_byte of 1e19 yocto/byte).
 */
export const executorNotEnoughBalance = (context: TestContext) => async () => {
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
        transfer({ amount: near('0.1') }),
        deployContract({
          wasmBytes: await getFileBytes('./wasm/write-get-record.wasm'),
        }),
      ],
      receiverAccountId: 'new.nat',
    },
  });

  await client.safeSendSignedTransaction({ signedTransaction });
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Executor.NotEnoughBalance');
  expect(txResult.result.error.context.executorAccountId).toBe('new.nat');
  expect(txResult.result.error.context.missingAmount.near).toBe('0.73734');
};
