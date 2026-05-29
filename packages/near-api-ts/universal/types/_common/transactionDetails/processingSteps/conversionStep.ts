import type { BlockHash, CryptoHash } from '../../common';
import type { NearGas } from '../../nearGas';
import type { NearToken } from '../../nearToken';

export type ConversionStepSuccess = {
  result: {
    status: 'Success';
    receiptId: CryptoHash;
  };
  executedAt: { blockHash: BlockHash };
  gasFee: NearToken;
  gasUsed: NearGas;
};

export type ConversionStepError = {
  result: {
    status: 'Error';
    error: { kind: unknown; context: unknown };
  };
  executedAt: { blockHash: BlockHash };
  gasFee: NearToken;
  gasUsed: NearGas;
};
