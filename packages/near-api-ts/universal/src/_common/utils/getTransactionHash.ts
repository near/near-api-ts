import { sha256 } from '@noble/hashes/sha2';
import { base58 } from '@scure/base';
import type { Base58String } from '../../../types/_common/common';
import type { InnerTransaction } from '../schemas/zod/transaction/transaction';
import { toBorshTransaction } from '../transformers/toBorshBytes/transaction';

type GetTransactionHashOutput = {
  transactionHash: Base58String;
  u8TransactionHash: Uint8Array;
};

export const getTransactionHash = (
  transaction: InnerTransaction,
): GetTransactionHashOutput => {
  const transactionBorshBytes = toBorshTransaction(transaction);
  const u8TransactionHash = sha256(transactionBorshBytes);
  return {
    transactionHash: base58.encode(u8TransactionHash),
    u8TransactionHash,
  };
};
