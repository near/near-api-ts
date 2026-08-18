import { expect } from 'vitest';
import { functionCall } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../action.test';

// `max_length_method_name` from the runtime config. Our schemas don't mirror it — the config
// owns the number and can change it — so the over-long name goes through the action creator
// untouched and the node is the one that rejects it.
const MAX_FUNCTION_NAME_LENGTH = 256;
const FUNCTION_NAME = 'a'.repeat(MAX_FUNCTION_NAME_LENGTH + 1);

export const functionNameTooLong = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      // The gas has to be non-zero: `validate_function_call_action` looks at it first, and
      // `FunctionCallZeroAttachedGas` would hide the name check.
      action: functionCall({ functionName: FUNCTION_NAME, gasLimit: { teraGas: '10' } }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.FunctionCall.FunctionName.TooLong');
  expect(tx.error.context.info).toStrictEqual({
    functionNameLength: FUNCTION_NAME.length,
    maximumFunctionNameLength: MAX_FUNCTION_NAME_LENGTH,
  });
};
