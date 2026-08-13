import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import {
  createAccount,
  deployContract,
  functionCall,
  near,
  transfer,
} from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/signServices/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import type { TestContext } from '../functionCall.test';

/**
 * wasmBase64 = compiled WAT: (module (func (export "add_record") (param i32)))
 *
 * `add_record` is exported with a param (i32), violating NEAR's required
 * `() -> ()` entrypoint signature -> Preparation.Failed
 */
export const methodInvalidSignature = (context: TestContext) => async () => {
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
          wasmBase64: 'AGFzbQEAAAABBQFgAX8AAwIBAAcOAQphZGRfcmVjb3JkAAAKBAECAAsACgRuYW1lAgMBAAA=',
        }),
        functionCall({
          functionName: 'add_record',
          functionArgs: { record: 'hello' },
          gasLimit: { teraGas: '10' },
        }),
      ],
      receiverAccountId: 'test.nat',
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
