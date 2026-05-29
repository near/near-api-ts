import type { AccountId, BlockHash, ReceiptId } from '../../common';
import type { ActionSummaries } from '../actionSummaries';

export type RefundStepResult =
  | {
      status: 'Success';
      data: unknown;
    }
  | {
      status: 'Error';
      error: { kind: unknown; context: unknown };
    };

export type RefundStep = {
  receiptId: ReceiptId;
  receiptSummary: {
    createdBy: { accountId: AccountId };
    createdAt: { blockHash: BlockHash };
    actionSummaries: ActionSummaries;
  };
  result: RefundStepResult;
  executedBy: { accountId: AccountId };
  executedAt: { blockHash: BlockHash };
};
