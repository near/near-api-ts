/**
 * Represents the different stages of a transaction processing workflow.
 *
 * Each stage answers two orthogonal questions:
 *   1. How far has processing progressed? (just converted → all receipts executed)
 *   2. How finalized is what we've seen so far?  (optimistic / final)
 *
 * The names related to nearcore's `TxExecutionStatus` enum:
 *
 * - **ConvertedOptimistic** (nearcore: `Included`): Transaction has been included
 *   in a block and converted into its initial receipt by the chunk producer.
 *   The block is not finalized yet, so this state can still be rolled back by a fork.
 *
 * - **ConvertedFinal** (nearcore: `IncludedFinal`): Transaction is included in a
 *   *finalized* block. The conversion to a receipt is now irreversible, but the
 *   receipt(s) it spawned have not finished executing yet (or their outcomes are
 *   not observed yet).
 *
 * - **ExecutedOptimistic** (nearcore: `ExecutedOptimistic`): Transaction is
 *   included in a block AND all non-refund receipts produced by it have finished
 *   executing. However, neither the block containing the transaction nor the
 *   blocks containing the receipt outcomes are guaranteed to be finalized — any
 *   of them can still be reorged.
 *
 *   Note: for transactions that produce no receipts (e.g. those that fail with `ConversionError`
 *   (nearcore: `InvalidTxError`) at apply time), this is the first observable "executed" stage.
 *
 * - **ExecutedNearlyFinal** (nearcore: `Executed`): Transaction is included in a
 *   *finalized* block AND all non-refund receipts have finished executing. The
 *   blocks containing receipt outcomes may still be non-final, and refund receipts
 *   may still be pending.
 *
 * - **CompletedFinal** (nearcore: `Final`): Transaction is included in a finalized
 *   block AND execution of every receipt (including refund receipts) is finalized.
 *   This is the terminal state — the outcome is fully irreversible.
 *
 * ---
 *
 * Mutual exclusivity of `ConvertedFinal` and `ExecutedOptimistic`:
 * A single transaction can pass through *at most one* of these two stages, never
 * both. They describe two different ways the same processing can race ahead:
 *   - `ConvertedFinal` — the tx-block finalized *before* receipts finished executing.
 *   - `ExecutedOptimistic` — receipts finished executing *before* the tx-block
 *     finalized.
 * As soon as both conditions hold (finalized tx-block AND non-refund receipts done),
 * the stage advances directly to `ExecutedNearlyFinal`, regardless of which
 * intermediate stage was observed.
 *
 * Possible flows (stages are monotonic; the two flows are disjoint after the first
 * step):
 * - *ConvertedOptimistic → ConvertedFinal → ExecutedNearlyFinal → CompletedFinal*
 *   (the block finalizes before receipts finish executing)
 * - *ConvertedOptimistic → ExecutedOptimistic → ExecutedNearlyFinal → CompletedFinal*
 *   (receipts finish executing before the block finalizes)
 *
 * For transactions that produce no receipts (`ConversionError`), only the
 * *ExecutedOptimistic → CompletedFinal* flow is reachable —
 * the `Converted*` and `ExecutedNearlyFinal` stages are skipped because there is
 * nothing distinct to observe at them.
 */
export type TransactionProcessingStageMap = {
  ConvertedOptimistic: 'ConvertedOptimistic';
  ConvertedFinal: 'ConvertedFinal';
  ExecutedOptimistic: 'ExecutedOptimistic';
  ExecutedNearlyFinal: 'ExecutedNearlyFinal';
  CompletedFinal: 'CompletedFinal';
};

export type TransactionProcessingStage = keyof TransactionProcessingStageMap;
export type MaybeTransactionProcessingStage = TransactionProcessingStage | undefined;
