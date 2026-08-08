import { expect } from 'vitest';
import { functionCall } from '../../../../../../../index';
import type { InnerTransaction } from '../../../../../../../src/_common/schemas/zod/transaction/transaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { signTamperedTransaction } from '../_common/signTamperedTransaction';
import type { TestContext } from '../action.test';

// `max_length_method_name` from the runtime config, which our `ContractFunctionNameZodSchema`
// mirrors as its own upper bound — so the name that trips the node is one character past what
// the action creator accepts, and this case has to be assembled without the schema check.
const MAX_FUNCTION_NAME_LENGTH = 256;
const FUNCTION_NAME = 'a'.repeat(MAX_FUNCTION_NAME_LENGTH + 1);

export const functionNameTooLong = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTamperedTransaction(
    defaultKeyPair,
    {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      // The gas has to be non-zero: `validate_function_call_action` looks at it first, and
      // `FunctionCallZeroAttachedGas` would hide the name check.
      action: functionCall({ functionName: 'any_function', gasLimit: { teraGas: '10' } }),
      receiverAccountId: 'alice',
    },
    (transaction) =>
      ({
        ...transaction,
        action: { ...transaction.action, functionName: FUNCTION_NAME },
      }) as InnerTransaction,
  );

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.FunctionCall.FunctionName.TooLong');
  expect(tx.error.context.info).toStrictEqual({
    functionNameLength: FUNCTION_NAME.length,
    maximumFunctionNameLength: MAX_FUNCTION_NAME_LENGTH,
  });
};
