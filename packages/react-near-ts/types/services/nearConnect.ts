import type { NearConnector } from '@hot-labs/near-connect';
import type { TransactionIntent, PublicKey, AccountId } from 'near-api-ts';
import type { Result } from '../_common.ts';
import type { ServiceCreator, ExecuteTransactionArgs, SafeExecuteTransaction, SafeSignMessage } from './_common.ts';

type CreateAccountAction = {
  createAccount: {};
};

type TransferAction = {
  transfer: {
    deposit: bigint;
  };
};

type AddKeyAction = {
  addKey: {
    publicKey: PublicKey;
    accessKey: {
      nonce: bigint;
      permission:
        | { fullAccess: {} }
        | {
            functionCall: {
              receiverId: string;
              allowance?: bigint;
              methodNames?: string[];
            };
          };
    };
  };
};

type FunctionCallAction = {
  functionCall: {
    methodName: string;
    args: Uint8Array;
    gas: bigint;
    deposit: bigint;
  };
};

type DeployContractAction = {
  deployContract: {
    code: Uint8Array;
  };
};

type StakeAction = {
  stake: {
    stake: bigint;
    publicKey: PublicKey;
  };
};

type DeleteKeyAction = {
  deleteKey: {
    publicKey: PublicKey;
  };
};

type DeleteAccountAction = {
  deleteAccount: {
    beneficiaryId: AccountId;
  };
};

export type NearConnectAction =
  | CreateAccountAction
  | TransferAction
  | AddKeyAction
  | FunctionCallAction
  | DeployContractAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction;

export type CreateSafeExecuteTransaction = (connector: NearConnector) => SafeExecuteTransaction;
export type CreateSafeSignMessage = (connector: NearConnector) => SafeSignMessage;

export type NearConnectNetworkId = 'mainnet' | 'testnet';

export type NearConnectServiceCreator = ServiceCreator<
  'nearConnector',
  { connector: NearConnector }
>;

export type CreateNearConnectorService = (args: {
  networkId: NearConnectNetworkId;
}) => NearConnectServiceCreator;
