import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { expect } from 'vitest';
import {
  addAccessKey,
  callContractFunction,
  deployLocalContract,
  signTransaction,
  transfer,
} from '../../../../../../../../index';
import { createSubAccount } from '../../../../../../../../src/transaction/actionCreators/createSubAccount';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../../../utils/getLastNonce';
import type { TestContext } from '../../callContractFunction.test';

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

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction1 = await signTransaction({
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
        createSubAccount(),
        transfer({ amount: { near: '10' } }),
        addAccessKey({
          publicKey: defaultKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
        deployLocalContract({ wasmU8 }),
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
      signer: {
        accountId: 'nat',
        publicKey: DEFAULT_PUBLIC_KEY,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(natAccessKey.accessKey) + 2,
        },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      actions: [
        callContractFunction({
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

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.CallContractFunction.Execution.Failed',
  );

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction2.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.CallContractFunction.Execution.Failed');

  expect(txResult.error.context.cause).toBe(
    '{"NewReceiptValidationError":{"ActionsValidation":"DeleteActionMustBeFinal"}}',
  );
};
