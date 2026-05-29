import type { AccountId, BlockHash, CryptoHash, Log, ReceiptId } from '../../common';
import type { NearGas } from '../../nearGas';
import type { NearToken } from '../../nearToken';
import type { ActionSummaries } from '../actionSummaries';

export type ReceivedDataId = CryptoHash;

export type DataReceiver = {
  dataId: CryptoHash;
  receiverAccountId: AccountId;
};

export type ExecutionStepResult =
  | {
      status: 'Success';
      data: unknown;
    }
  | {
      status: 'ContinuesIn';
      receiptId: CryptoHash;
    }
  | {
      status: 'Error';
      error: { kind: unknown; context: unknown };
    };

export type ExecutionStep = {
  receiptId: ReceiptId;
  receiptSummary: {
    createdBy: { accountId: AccountId };
    createdAt: { blockHash: BlockHash };
    actionSummaries: ActionSummaries;
    requiredDataIds: ReceivedDataId[];
    futureDataReceivers: DataReceiver[];
    isPromiseYield: boolean;
  };
  result: ExecutionStepResult;
  executedBy: { accountId: AccountId };
  executedAt: { blockHash: BlockHash };
  createdReceiptIds: ReceiptId[];
  gasFee: NearToken;
  gasUsed: NearGas;
  logs: Log[];
};
