import type { AccountId, BlockHash, ReceiptId } from '../../common';
import type { NearToken } from '../../nearToken';

export type RefundStepResult =
  | {
      status: 'Success';
    }
  | {
      status: 'Error';
      error: {
        kind: 'Receiver.NotFound';
        receiverAccountId: AccountId;
      };
    };

export type RefundStep = {
  refundStepId: ReceiptId;
  refundAmount: NearToken;
  result: RefundStepResult;
  createdAt: { blockHash: BlockHash };
  createdBy: { executionStepId: ReceiptId };
  executedAt: { blockHash: BlockHash };
  executedBy: { accountId: AccountId };
};
