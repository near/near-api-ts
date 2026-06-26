import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { functionCall, signTransaction } from '../../../../../../../index';
import { safeSleep } from '../../../../../../../src/_common/utils/sleep';
import { createAccount } from '../../../../../../../src/helpers/actionCreators/createAccount';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { log } from '../../../../../../utils/common';
import type { TestContext } from './createExecutionStep.test';

export const invalidDeleteAccountActionPosition = (context: TestContext) => async () => {
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
        functionCall({
          // functionName: 'produce_invalid_receiver_id_error',
          functionName: 'invalid_delete_account_action_position',
          gasLimit: { teraGas: '10' },
        }),
      ],
      receiverAccountId: 'contract.nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });
  log(tx);

  // await safeSleep(500);
  //
  // const txResult = await client.getTransactionResult({
  //   transactionHash: signedTransaction.transactionHash,
  // });
  // log(txResult);

  // assertTxResultExecutionErrKind(txResult, 'Action.FunctionCall.Compilation.Failed');
};
