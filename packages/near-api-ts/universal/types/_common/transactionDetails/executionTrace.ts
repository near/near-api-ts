import type { CryptoHash } from '../common';

type TransactionToReceiptConversionStep = {
  receiptId: CryptoHash;
};

type ExecutionStep = {
  receiptId: CryptoHash;
};

export type ExecutionTrace = [TransactionToReceiptConversionStep, ...ExecutionStep[]];
