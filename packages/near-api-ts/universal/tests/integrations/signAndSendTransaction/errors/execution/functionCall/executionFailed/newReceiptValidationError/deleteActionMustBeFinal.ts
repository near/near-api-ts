import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import {
  addFullAccessKey,
  deployContract,
  functionCall,
  signTransaction,
  transfer,
} from '../../../../../../../../index';
import { safeSleep } from '../../../../../../../../src/_common/utils/sleep';
import { createAccount } from '../../../../../../../../src/helpers/actionCreators/createAccount';
import { assertTxResultExecutionErrKind } from '../../../../../../../utils/assertTxResultExecutionErrKind';
import { log } from '../../../../../../../utils/common';
import type { TestContext } from '../../functionCall.test';

export const deleteActionMustBeFinal = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  // #1 Deploy test contract
  const wasmBytes = new Uint8Array(
    await readFile(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        './contract/wasm/contract_with_errors.wasm',
      ),
    ),
  );

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction1 = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      actions: [
        createAccount(),
        transfer({ amount: { near: '10' } }),
        addFullAccessKey(defaultKeyPair),
        deployContract({ wasmBytes }),
      ],
      receiverAccountId: 'contract.nat',
    },
  });

  await client.safeSendSignedTransaction(signedTransaction1);
  await safeSleep(500);

  // #2 Call contract function for error
  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: accountAccessKey.nonce + 2,
      blockHash,
      actions: [
        functionCall({
          functionName: 'delete_action_must_be_final',
          gasLimit: { teraGas: '500' },
        }),
      ],
      receiverAccountId: 'contract.nat',
    },
  });

  await client.safeSendSignedTransaction(signedTransaction);
  await safeSleep(500);

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });
  log(txResult);

  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Execution.Failed');

  expect(txResult.result.error.context.cause).toBe(
    '{"NewReceiptValidationError":{"ActionsValidation":"DeleteActionMustBeFinal"}}',
  );
};
