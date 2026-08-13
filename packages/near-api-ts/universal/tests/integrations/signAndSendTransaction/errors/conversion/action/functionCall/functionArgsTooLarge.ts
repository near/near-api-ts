import { functionCall } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/createMemorySignService/signTransaction/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../../utils/assertUnmappedInvalidTxError';
import type { TestContext } from '../action.test';

// `max_arguments_length` from the runtime config.
const MAX_FUNCTION_ARGS_SIZE_BYTES = 4_194_304;
const FUNCTION_ARGS_SIZE_BYTES = MAX_FUNCTION_ARGS_SIZE_BYTES + 1;

/**
 * Unreachable over JSON-RPC, so the case is registered as skipped (see `action.test.ts`) and
 * `FunctionCallArgumentsLengthExceeded` is left out of `ConversionFailureKind` — for the same
 * reason as its `deployContract/contractWasmTooLarge` sibling, which documents it in full: the
 * 4 MiB limit is past the 2 MiB request body the node accepts, so the transaction is never
 * delivered, and neither limit can be moved from the outside because both are baked into
 * `neard` at build time.
 */
export const functionArgsTooLarge = (context: TestContext) => async () => {
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
      // The gas has to be non-zero and the name short enough: both are checked before the
      // arguments in `validate_function_call_action`. The default serializer would turn the
      // arguments into JSON, so the raw bytes are handed over as they are.
      action: functionCall({
        functionName: 'any_function',
        functionArgs: new Uint8Array(FUNCTION_ARGS_SIZE_BYTES),
        gasLimit: { teraGas: '10' },
        options: { serializeArgs: ({ functionArgs }) => functionArgs },
      }),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertUnmappedInvalidTxError(tx, {
    ActionsValidation: {
      FunctionCallArgumentsLengthExceeded: {
        length: FUNCTION_ARGS_SIZE_BYTES,
        limit: MAX_FUNCTION_ARGS_SIZE_BYTES,
      },
    },
  });
};
