import { expect } from 'vitest';
import { addFunctionCallKey, randomEd25519KeyPair } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/signServices/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../action.test';

// `max_number_bytes_method_names` from the runtime config.
const MAX_NUMBER_BYTES_METHOD_NAMES = 2000;

// Every name stays under `max_length_method_name` (256), the per-name limit, so only the
// total trips the node.
const FUNCTION_NAME_LENGTH = 250;
const FUNCTION_NAMES_COUNT = 10;

export const allowedFunctionsTotalSizeExceeded = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const allowedFunctions = Array.from(
    { length: FUNCTION_NAMES_COUNT },
    (_, i) => `${'a'.repeat(FUNCTION_NAME_LENGTH - String(i).length)}${i}`,
  );

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
        allowedFunctions,
      }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.AddKey.AllowedFunctions.TotalSize.Exceeded',
  );
  expect(tx.error.context.info).toStrictEqual({
    // The node counts a terminating byte after every name.
    totalSizeBytes: FUNCTION_NAMES_COUNT * (FUNCTION_NAME_LENGTH + 1),
    maximumTotalSizeBytes: MAX_NUMBER_BYTES_METHOD_NAMES,
  });
};
