import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import {
  addAccessKey,
  deployContract,
  functionCall,
  signTransaction,
  transfer,
} from '../../../../../../../../index';
import { createAccount } from '../../../../../../../../src/transaction/actionCreators/createAccount';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../../../utils/getLastNonce';
import type { TestContext } from '../../functionCall.test';

export const deleteActionMustBeFinal = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  // #1 Deploy test contract
  const wasmU8 = new Uint8Array(
    await readFile(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        './contract/wasm/contract_with_errors.wasm',
      ),
    ),
  );

  const {
    accessKey,
    atMomentOf: { blockHash },
  } = await client.getAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction1 = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: getLastNonce(accessKey) + 1,
      blockHash,
      actions: [
        createAccount(),
        transfer({ amount: { near: '10' } }),
        addAccessKey({
          publicKey: defaultKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
        deployContract({ wasmU8 }),
      ],
      receiverAccountId: 'contract.nat',
    },
  });

  await client.safeSendSignedTransaction({
    signedTransaction: signedTransaction1,
    minimalProcessingStage: 'CompletedFinal',
  });

  // #2 Call contract function for error
  const signedTransaction2 = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: getLastNonce(accessKey) + 2,
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

  const tx = await client.safeSendSignedTransaction({
    signedTransaction: signedTransaction2,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.FunctionCall.Execution.Failed');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction2.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Execution.Failed');

  expect(txResult.error.context.cause).toBe(
    '{"NewReceiptValidationError":{"ActionsValidation":"DeleteActionMustBeFinal"}}',
  );
};
