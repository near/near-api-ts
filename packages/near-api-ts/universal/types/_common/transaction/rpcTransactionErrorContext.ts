import type { RpcResponse } from '../../../src/_common/schemas/zod/rpc/rpc';
import type { AccountId, CryptoHash, TransactionNonce } from '../common';
import type { NearToken } from '../nearToken';
import type { ProcessingStage } from '../transactionDetails/processingStage';

export type TransactionErrorContext = {
  NotFound: {
    transactionHash: CryptoHash;
  };
  NotCompleted: {
    transactionHash: CryptoHash;
    currentProcessingStage:
      | ProcessingStage['ConvertedOptimistic']
      | ProcessingStage['ConvertedFinal']
      | ProcessingStage['ExecutedOptimistic']
      | ProcessingStage['ExecutedNearlyFinal'];
  };
  Expired: null;
  Timeout: null;
  Nonce: {
    // TODO Rename - it's not clear why nonce is invalid. Better name - TooLow
    Invalid: {
      transactionNonce: TransactionNonce;
      accessKeyNonce: TransactionNonce;
    };
  };
  Signer: {
    NotFound: {
      signerAccountId: AccountId;
    };
    Balance: {
      TooLow: {
        transactionCost: NearToken;
        signerAccountId: AccountId;
      };
    };
  };
  Receiver: {
    NotFound: {
      receiverAccountId: AccountId;
      actionIndex: number;
      transactionHash: CryptoHash;
    };
  };
  Signature: {
    Invalid: null;
  };
  Action: {
    // TODO What is this error about?
    InvalidIndex: {
      rpcResponse: RpcResponse;
    };
    CreateAccount: {
      AlreadyExist: {
        accountId: AccountId;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
    };
    Stake: {
      BelowThreshold: {
        accountId: AccountId;
        proposedStake: NearToken;
        minimumStake: NearToken;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
      Balance: {
        TooLow: {
          accountId: AccountId;
          proposedStake: NearToken;
          totalBalance: NearToken;
          missingAmount: NearToken;
          actionIndex: number;
          transactionHash: CryptoHash;
        };
      };
      NotFound: {
        accountId: AccountId;
        actionIndex: number;
        transactionHash: CryptoHash;
      };
    };
  };
};
