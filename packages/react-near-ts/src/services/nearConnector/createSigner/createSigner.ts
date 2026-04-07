import type { NearConnectorServiceCreator } from '../../../../types/services/nearConnector.ts';
import { createCanExecuteTransaction, createSafeExecuteTransaction } from './executeTransaction.ts';
import { createCanSignDelegation, createSafeSignDelegation } from './signDelegation.ts';
import { createCanSignMessage, createSafeSignMessage } from './signMessage.ts';

export const createSigner: NearConnectorServiceCreator['createSigner'] = (args) => ({
  serviceId: 'nearConnector',
  safeExecuteTransaction: createSafeExecuteTransaction(args.serviceBox.connector),
  canExecuteTransaction: createCanExecuteTransaction(args.serviceBox.connector),
  safeSignMessage: createSafeSignMessage(args.serviceBox.connector),
  canSignMessage: createCanSignMessage(args.serviceBox.connector),
  safeSignDelegation: createSafeSignDelegation(args.serviceBox.connector),
  canSignDelegation: createCanSignDelegation(args.serviceBox.connector),
});
