import { addFunctionCallKey, randomEd25519KeyPair } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../utils/assertUnmappedInvalidTxError';
import type { TestContext } from './actionsValidation.test';

// `max_number_bytes_method_names` from the runtime config.
const MAX_NUMBER_BYTES_METHOD_NAMES = 2000;

// Every name stays under `max_length_method_name` (256), the per-name limit our
// `ContractFunctionNameZodSchema` already enforces, so only the total trips the node.
const METHOD_NAME_LENGTH = 250;
const METHOD_NAMES_COUNT = 10;

export const addKeyMethodNamesNumberOfBytesExceeded = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const allowedFunctions = Array.from(
    { length: METHOD_NAMES_COUNT },
    (_, i) => `${'a'.repeat(METHOD_NAME_LENGTH - String(i).length)}${i}`,
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

  assertUnmappedInvalidTxError(tx, {
    ActionsValidation: {
      AddKeyMethodNamesNumberOfBytesExceeded: {
        limit: MAX_NUMBER_BYTES_METHOD_NAMES,
        // The node counts a terminating character after every name.
        totalNumberOfBytes: METHOD_NAMES_COUNT * (METHOD_NAME_LENGTH + 1),
      },
    },
  });
};
