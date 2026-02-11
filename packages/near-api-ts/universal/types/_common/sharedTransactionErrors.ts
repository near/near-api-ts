import type { AccountId, CryptoHash } from './common';
import type { NearToken } from './nearToken';

// Common transaction errors for:
// Client.SendSignedTransaction +
// MemorySigner.ExecuteTransaction
export type SharedTransactionErrorVariant<Prefix extends string> =
  | {
      kind: `${Prefix}.Rpc.Transaction.Signer.Balance.TooLow`;
      context: {
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
    }
  | {
      kind: `${Prefix}.Rpc.Transaction.Action.Stake.BelowThreshold`;
      context: {
        accountId: AccountId;
        proposedStake: NearToken;
        minimumStake: NearToken;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
    }
  | {
      kind: `${Prefix}.Rpc.Transaction.Action.Stake.Balance.TooLow`;
      context: {
        accountId: AccountId;
        proposedStake: NearToken;
        totalBalance: NearToken;
        missingAmount: NearToken;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
    }
  | {
      kind: `${Prefix}.Rpc.Transaction.Action.Stake.NotFound`;
      context: {
        accountId: AccountId;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
    };
