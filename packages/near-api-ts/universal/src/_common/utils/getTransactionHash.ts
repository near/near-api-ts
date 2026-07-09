import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import type { Base58String } from '../../../types/_common/common';
import type { InnerTransaction } from '../schemas/zod/transaction/transaction';
import { getTransactionBorsh } from '../transformers/toBorshBytes/transaction';

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
