import type { RpcResponse } from '../../../src/_common/schemas/zod/rpc';
import type { AccountId, CryptoHash, Nonce } from '../common';
import type { NearToken } from '../nearToken';

export type TransactionErrorContext = {
  NotFound: { transactionHash: CryptoHash; signerAccountId: AccountId };
  Expired: null;
  Timeout: null;
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
  Action: {
    InvalidIndex: { rpcResponse: RpcResponse }; // TODO What is this error about?
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
