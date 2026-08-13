import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import type { Base58String } from '../../../types/_common/common';
import { getTransactionBorsh } from './toBorshBytes/transaction';
import type { InnerTransaction } from './zodSchemas/transaction';

type GetTransactionHashOutput = {
  transactionHash: Base58String;
  transactionHashU8: Uint8Array;
};

export const getTransactionHash = (transaction: InnerTransaction): GetTransactionHashOutput => {
  const transactionBorshU8 = getTransactionBorsh(transaction);
  const transactionHashU8 = sha256(transactionBorshU8);
  return {
    transactionHash: base58.encode(transactionHashU8),
    transactionHashU8,
  };
};
