import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import { createAccount, deployContract, near, transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
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
export const executorBudgetNotEnough = (context: TestContext) => async () => {
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

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Executor.Budget.NotEnough');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Executor.Budget.NotEnough');
  expect(txResult.error.context.executorAccountId).toBe('new.nat');
  expect(txResult.error.context.minimalMissingAmount.near).toBe('0.73734');
};
