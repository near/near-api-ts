import type { Transaction } from 'nat-types/transaction';
import type { Base58String } from 'nat-types/common';
import { sha256 } from '@noble/hashes/sha2';
import { base58 } from '@scure/base';
import { transactionToBorsh } from '@common/transformers/borsh/transactionToBorsh';

type GetTransactionHashOutput = {
  transactionHash: Base58String;
  u8TransactionHash: Uint8Array;
};

export const getTransactionHash = (
  transaction: Transaction,
): GetTransactionHashOutput => {
  const transactionBorshBytes = transactionToBorsh(transaction);
  const u8TransactionHash = sha256(transactionBorshBytes);
  return {
    transactionHash: base58.encode(u8TransactionHash),
    u8TransactionHash,
  };
};
