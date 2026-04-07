import type { NearConnector } from '@hot-labs/near-connect';
import type { AccountId, PublicKey } from 'near-api-ts';
import type {
  CanExecuteTransaction,
  CanSignDelegation,
  CanSignMessage,
  SafeExecuteTransaction,
  SafeSignDelegation,
  SafeSignMessage,
  ServiceCreator,
} from './_common.ts';

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

export type NearConnectorAction =
  | CreateAccountAction
  | TransferAction
  | AddKeyAction
  | FunctionCallAction
  | DeployContractAction
  | StakeAction
  | DeleteKeyAction
  | DeleteAccountAction;

export type CreateSafeExecuteTransaction = (connector: NearConnector) => SafeExecuteTransaction;
export type CreateCanExecuteTransaction = (connector: NearConnector) => CanExecuteTransaction;

export type CreateSafeSignMessage = (connector: NearConnector) => SafeSignMessage;
export type CreateCanSignMessage = (connector: NearConnector) => CanSignMessage;

export type CreateSafeSignDelegation = (connector: NearConnector) => SafeSignDelegation;
export type CreateCanSignDelegation = (connector: NearConnector) => CanSignDelegation;

export type NearConnectorServiceCreator = ServiceCreator<
  'nearConnector',
  { connector: NearConnector }
>;

export type CreateNearConnectorServiceArgs = {
  supportedFeatures?: {
    signInAdditionalAction?: {
      signMessage?: boolean;
      addFunctionCallKey?: boolean;
    };
    signMessage?: boolean;
    signDelegation?: boolean;
  };
};

export type CreateNearConnectorService = (
  args?: CreateNearConnectorServiceArgs,
) => NearConnectorServiceCreator;
