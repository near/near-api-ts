import { expect } from 'vitest';
import { addFunctionCallKey, randomEd25519KeyPair } from '../../../../../../../index';
import type { InnerTransaction } from '../../../../../../../src/_common/schemas/zod/transaction/transaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { signTamperedTransaction } from '../_common/signTamperedTransaction';
import type { TestContext } from '../action.test';

// `max_length_method_name` from the runtime config — the same limit `functionCall`'s own name
// is held to, and the same one our `ContractFunctionNameZodSchema` enforces, so this case also
// has to be assembled without the schema check.
const MAX_FUNCTION_NAME_LENGTH = 256;
const FUNCTION_NAME = 'a'.repeat(MAX_FUNCTION_NAME_LENGTH + 1);

export const allowedFunctionsFunctionNameTooLong = (context: TestContext) => async () => {
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
      action: addFunctionCallKey({
        publicKey: randomEd25519KeyPair().publicKey,
        contractAccountId: 'alice',
        gasBudget: 'Unlimited',
        allowedFunctions: ['ping'],
      }),
      receiverAccountId: 'nat',
    },
    (transaction) =>
      ({
        ...transaction,
        action: { ...transaction.action, allowedFunctions: [FUNCTION_NAME] },
      }) as InnerTransaction,
  );

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.AddKey.AllowedFunctions.FunctionName.TooLong',
  );
  // A single name over the limit trips the per-name check inside the loop, before the total
  // the names add up to is compared against `max_number_bytes_method_names`.
  expect(tx.error.context.info).toStrictEqual({
    functionNameLength: FUNCTION_NAME.length,
    maximumFunctionNameLength: MAX_FUNCTION_NAME_LENGTH,
  });
};
