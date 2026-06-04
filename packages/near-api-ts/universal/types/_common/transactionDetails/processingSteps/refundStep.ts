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
      };
    };

export type RefundStep = {
  refundStepId: ReceiptId;
  receiverAccountId: AccountId;
  refundAmount: NearToken;
  result: RefundStepResult;
  createdAt: { blockHash: BlockHash };
  executedAt: { blockHash: BlockHash };
};
