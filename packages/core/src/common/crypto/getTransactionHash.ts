import type { Transaction } from 'nat-types/common/transaction';
import type { Base58String } from 'nat-types';
import { sha256 } from '@noble/hashes/sha2';
import { base58 } from '@scure/base';
import { serializeTransactionToBorsh } from '../transformers/transaction';

type GetTransactionHashOutput = {
  transactionHash: Base58String;
  u8TransactionHash: Uint8Array;
};

export const getTransactionHash = (
  transaction: Transaction,
): GetTransactionHashOutput => {
  const borshTransaction = serializeTransactionToBorsh(transaction);
  const u8TransactionHash = sha256(borshTransaction);
  return {
    transactionHash: base58.encode(u8TransactionHash),
    u8TransactionHash,
  };
};
