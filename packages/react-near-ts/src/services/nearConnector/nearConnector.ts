import type { CreateNearConnectorService } from '../../../types/services/nearConnector.ts';
import { createCreateService } from './createService.ts';
import { createSigner } from './createSigner/createSigner.ts';

export const createNearConnectorService: CreateNearConnectorService = (args) => {
  // TODO Validate Args
  return {
    serviceId: 'nearConnector',
    createService: createCreateService(args),
    createSigner,
  };
};
