import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import {
  addAccessKey,
  createAccount,
  deployContract,
  functionCall,
  transfer,
} from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../utils/assertTxResultExecutionErrKind';
import { getFileBytes } from '../../../../../utils/common';
import { getLastNonce } from '../../../../../utils/getLastNonce';
import type { TestContext } from './functionCall.test';

export const functionNotFound = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const {
    accessKey,
    atMomentOf: { blockHash },
  } = await client.getAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction = await signTransaction({
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
        deployContract({ wasmU8: await getFileBytes('./wasm/write-get-record.wasm') }),
        functionCall({
          functionName: 'not_exist',
          gasLimit: { teraGas: '10' },
        }),
      ],
      receiverAccountId: 'contract.nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.FunctionCall.Function.NotFound');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Function.NotFound');
};
