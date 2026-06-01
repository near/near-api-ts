import type { AccountId, BlockHash, ReceiptId } from '../../common';
import type { ActionSummaries } from '../actionSummaries';

export type RefundStepResult =
  | {
      status: 'Success';
    }
  | {
      status: 'Error';
      error: { kind: unknown; context: unknown };
    };

export type RefundStep = {
  refundStepId: ReceiptId;
  result: RefundStepResult;
  createdAt: { blockHash: BlockHash };
  createdBy: { executionStepId: ReceiptId };
  executedAt: { blockHash: BlockHash };
  executedBy: { accountId: AccountId };
  actionSummaries: ActionSummaries;
};

// created: {
//   at: { blockHash: BlockHash };
//   by: { accountId: AccountId };
//   during: { step: 'Execution'; receiptId: ReceiptId };
// };

// executed: {
//   at: { blockHash: BlockHash };
//   by: { accountId: AccountId };
// };
