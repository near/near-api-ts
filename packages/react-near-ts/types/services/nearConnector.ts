import type { NearConnector } from '@hot-labs/near-connect';
import type {
  CanExecuteTransaction,
  CanSignDelegation,
  CanSignMessage,
  SafeExecuteTransaction,
  SafeSignDelegation,
  SafeSignMessage,
  ServiceCreator,
} from './_common.ts';

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
