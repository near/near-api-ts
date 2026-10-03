import { expect } from 'vitest';
import { addAccessKey, randomEd25519KeyPair } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
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

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(natAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      action: addAccessKey({
        publicKey: randomEd25519KeyPair().publicKey,
        permission: {
          kind: 'FunctionCall',
          allowedContract: 'alice',
          allowedFunctions: allowedFunctions,
        },
        gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
      }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(
    tx,
    'Client.SendSignedTransaction.Rpc.Action.AddAccessKey.AllowedFunctions.TotalSize.Exceeded',
  );
  expect(tx.error.context.info).toStrictEqual({
    // The node counts a terminating byte after every name.
    totalSizeBytes: FUNCTION_NAMES_COUNT * (FUNCTION_NAME_LENGTH + 1),
    maximumTotalSizeBytes: MAX_NUMBER_BYTES_METHOD_NAMES,
  });
};
