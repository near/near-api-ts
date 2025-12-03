import type { Base58String } from 'nat-types/_common/common';
import { sha256 } from '@noble/hashes/sha2';
import { base58 } from '@scure/base';
import { serializeTransaction } from '@common/transformers/toBorshBytes/transaction';
import type { InnerTransaction } from '@common/schemas/zod/transaction/transaction';

type GetTransactionHashOutput = {
  transactionHash: Base58String;
  u8TransactionHash: Uint8Array;
};

export const getTransactionHash = (
  transaction: InnerTransaction,
): GetTransactionHashOutput => {
  const transactionBorshBytes = serializeTransaction(transaction);
  const u8TransactionHash = sha256(transactionBorshBytes);
  return {
    transactionHash: base58.encode(u8TransactionHash),
    u8TransactionHash,
  };
};
