import { NearConnector } from '@hot-labs/near-connect';
import type { CreateNearConnectorService } from '../../../types/services/nearConnect.ts';
import { createSafeExecuteTransaction } from './executeTransaction/executeTransaction.ts';
import { createSafeSignMessage } from './signMessage.ts';

const serviceId = 'nearConnector';

export const createNearConnectorService: CreateNearConnectorService = (args) => ({
  serviceId,

  createService: () => {
    const connector = new NearConnector({ network: args.networkId });
    return {
      serviceId,
      serviceBox: { connector },
    };
  },

  createSigner: (args: { serviceBox: { connector: NearConnector } }) => {
    return {
      serviceId,
      safeExecuteTransaction: createSafeExecuteTransaction(args.serviceBox.connector),
      safeSignMessage: createSafeSignMessage(args.serviceBox.connector),
    };
  },
});
