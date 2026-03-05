import { NearConnector } from '@hot-labs/near-connect';
import { createSafeExecuteTransaction } from './createSafeExecuteTransaction.ts';

const serviceId = 'nearConnector';

export const createNearConnectorService = ({ networkId }: any) => ({
  serviceId,
  createService: () => {
    const connector = new NearConnector({
      network: networkId,
    });
    return {
      serviceId,
      serviceBox: { connector },
    };
  },
  createSigner: ({ serviceBox }: any) => {
    return {
      serviceId,
      safeExecuteTransaction: createSafeExecuteTransaction(
        serviceBox.connector,
      ),
    };
  },
});
