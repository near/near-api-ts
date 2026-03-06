import { NearConnector } from '@hot-labs/near-connect';
import { createSafeExecuteTransaction } from './executeTransaction/executeTransaction.ts';
import type { CreateNearConnectorService } from '../../../types/services/nearConnect.ts';

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
    };
  },
});
