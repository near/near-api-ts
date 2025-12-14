import type { AccountId, CryptoHash } from 'nat-types/_common/common';
import type { NearToken } from 'nat-types/_common/nearToken';

// Common transaction errors for:
// Client.SendSignedTransaction +
// MemorySigner.ExecuteTransaction
export type SharedTransactionErrorVariant<Prefix extends string> =
  | {
      kind: `${Prefix}.Rpc.Transaction.Signer.Balance.TooLow`;
      context: {
        balance: NearToken;
        transactionCost: NearToken;
        signerAccountId: AccountId;
      };
    }
  | {
      kind: `${Prefix}.Rpc.Transaction.Receiver.NotFound`;
      context: {
        receiverAccountId: AccountId;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
    }
  | {
      kind: `${Prefix}.Rpc.Transaction.Timeout`;
      context: null;
    }
  | {
      kind: `${Prefix}.Rpc.Transaction.Action.CreateAccount.AlreadyExist`;
      context: {
        accountId: AccountId;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
    };
