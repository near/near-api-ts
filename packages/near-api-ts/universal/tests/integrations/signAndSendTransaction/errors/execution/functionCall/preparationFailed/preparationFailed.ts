import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import {
  addAccessKey,
  createAccount,
  deployContract,
  functionCall,
  transfer,
} from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../functionCall.test';

export const preparationFailed = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: DEFAULT_PUBLIC_KEY,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: DEFAULT_PUBLIC_KEY,
      nonce: getLastNonce(natAccessKey.accessKey) + 1,
      blockHash: natAccessKey.atMomentOf.blockHash,
      actions: [
        createAccount(),
        transfer({ amount: { near: '10' } }),
        addAccessKey({
          publicKey: defaultKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
        deployContract({ wasmU8: Uint8Array.from([1, 2, 3]) }),
        functionCall({
          functionName: 'add_record',
          functionArgs: { record: 'hello' },
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

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.FunctionCall.Preparation.Failed');

  const txResult = await client.getTransactionResult({
    transactionHash: signedTransaction.transactionHash,
  });

  assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Preparation.Failed');
};
