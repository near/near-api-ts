import type { AccountId, BlockHash, ReceiptId } from '../../../../../../_common/common';
import type { NearToken } from '../../../../../../_common/nearToken';

export type RefundStepResult =
  | {
      status: 'Success';
    }
  | {
      status: 'Error';
      error: {
        kind: 'Receiver.NotFound';
        context: null;
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
