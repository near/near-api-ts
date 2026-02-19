import type { RpcResponse } from '@universal/src/_common/schemas/zod/rpc';
import type { AccountId, CryptoHash, Nonce } from '../common';
import type { NearToken } from '../nearToken';

export type TransactionErrorContext = {
  Nonce: {
    Invalid: { transactionNonce: Nonce; accessKeyNonce: Nonce };
  };
  Signer: {
    NotFound: { signerAccountId: AccountId };
    Balance: {
      TooLow: { transactionCost: NearToken; signerAccountId: AccountId };
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
  Expired: null;
  Timeout: null;
  Action: {
    InvalidIndex: { rpcResponse: RpcResponse };
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
