import { deployContract } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../utils/assertUnmappedInvalidTxError';
import type { TestContext } from './general.test';

// `max_transaction_size` from the runtime config — the borsh-serialized transaction has
// to stay below it. Lowered from 4 MiB to 1.5 MiB in protocol version 69
// (`core/parameters/res/runtime_configs/69.yaml`); a sandbox on protocol version 86 reports
// exactly this value.
const MAX_TRANSACTION_SIZE = 1_572_864;

/**
 * Unreachable over JSON-RPC, so the case is registered as skipped (see `general.test.ts`).
 *
 * The node checks the size in `ValidatedTransaction::check_valid_for_config`
 * (`core/primitives/src/transaction.rs`) — after action validation and the protocol-version
 * gates, but before the signature is verified. The measured size is
 * `SignedTransaction::size_for_limits`: from `PostQuantumSignatures` (protocol version 85)
 * onward it is `wire_size` — the borsh body plus the signature, i.e. exactly the bytes behind
 * `signedTransactionBorsh64`; on older versions it was `get_size`, the body alone, with the
 * signature not counted.
 *
 * So a transaction has to be at least `MAX_TRANSACTION_SIZE + 1` = 1_572_865 bytes, which is
 * 2_097_156 base64 characters — while the node buffers at most 2 MiB = 2_097_152 bytes of
 * request body and answers anything bigger with a plain HTTP 413 `Failed to buffer the request
 * body: length limit exceeded`. That ceiling is axum's implicit `DefaultBodyLimit` in front of
 * the `Json` extractor of `rpc_handler`, and nearcore never disables it —
 * `RequestBodyLimitLayer::new(json_payload_max_size)` (`chain/jsonrpc/src/lib.rs`) only adds an
 * outer limit, so the effective one is `min(2 MiB, json_payload_max_size)` no matter how high
 * the config goes (near-sandbox already raises it to 1 GiB). Boundary measured on 2.13.2.
 *
 * Every transaction large enough to trigger the error is therefore already 4+ bytes too large
 * to be sent — even with an empty JSON envelope. It never reaches the runtime, and
 * `safeSendSignedTransaction` fails with `Client.SendSignedTransaction.Exhausted` wrapping
 * `SendRequest.Attempt.Response.JsonParseFailed` instead. The check itself is live on the paths
 * that don't go through this HTTP layer: `Runtime::apply` for transactions arriving inside a
 * chunk, and `pre_validate_chunk_state_witness` for chunk validators. The case is kept ready
 * for a node whose body limit leaves room for it.
 */
export const transactionSizeExceeded = (context: TestContext) => async () => {
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
      // Contract code is the cheapest way to push the transaction over the limit; it is
      // never compiled, the size check happens long before execution.
      action: deployContract({ wasmBytes: new Uint8Array(MAX_TRANSACTION_SIZE + 1) }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertUnmappedInvalidTxError(tx, {
    TransactionSizeExceeded: {
      size: Uint8Array.fromBase64(signedTransaction.signedTransactionBorsh64).length,
      limit: MAX_TRANSACTION_SIZE,
    },
  });
};
