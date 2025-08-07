import type { Transaction } from 'nat-types/transaction';
import type { Base58String } from 'nat-types/common';
import { sha256 } from '@noble/hashes/sha2';
import { base58 } from '@scure/base';
import { toBorshTransaction } from '@common/transformers/toBorshTransaction';

type GetTransactionHashOutput = {
  transactionHash: Base58String;
  u8TransactionHash: Uint8Array;
};

export const getTransactionHash = (
  transaction: Transaction,
): GetTransactionHashOutput => {
  const borshTransaction = toBorshTransaction(transaction);
  const u8TransactionHash = sha256(borshTransaction);
  return {
    transactionHash: base58.encode(u8TransactionHash),
    u8TransactionHash,
  };
};
