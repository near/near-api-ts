import { NearConnector } from '@hot-labs/near-connect';
import * as z from 'zod/mini';

export const NearConnectorServiceSchema = z.object({
  nearConnector: z.object({
    serviceBox: z.object({
      connector: z.instanceof(NearConnector),
    }),
  }),
});
