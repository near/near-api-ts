import { expect } from 'vitest';
import { addFunctionCallKey, randomEd25519KeyPair } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/createMemorySignService/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../action.test';

// `max_length_method_name` from the runtime config — the same limit `functionCall`'s own name
// is held to. The config owns the number, so our schemas don't mirror it and the node is the
// one that rejects the name.
const MAX_FUNCTION_NAME_LENGTH = 256;
const FUNCTION_NAME = 'a'.repeat(MAX_FUNCTION_NAME_LENGTH + 1);

export const allowedFunctionsFunctionNameTooLong = (context: TestContext) => async () => {
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
      action: addFunctionCallKey({
        publicKey: randomEd25519KeyPair().publicKey,
        contractAccountId: 'alice',
        gasBudget: 'Unlimited',
        allowedFunctions: [FUNCTION_NAME],
      }),
      receiverAccountId: 'nat',
    },
  });

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
