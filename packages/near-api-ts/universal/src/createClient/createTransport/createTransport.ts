import * as z from 'zod/mini';
import type { CreateTransport, TransportContext } from '../../../types/client/transport/transport';
import { PartialTransportPolicyZodSchema } from '../../_common/zodSchemas/transportPolicy';
import {
  defaultTransportPolicy,
  mergeTransportPolicy,
} from './_common/transportPolicy/transportPolicy';
import { createSendRequest } from './createSendRequest/createSendRequest';
import { getInnerRpcEndpoints, RpcEndpointsArgsSchema } from './rpcEndpoints';

export const CreateTransportArgsZodSchema = z.object({
  rpcEndpoints: RpcEndpointsArgsSchema,
  policy: z.optional(PartialTransportPolicyZodSchema),
});

export const createTransport: CreateTransport = (args) => {
  const transportPolicy = mergeTransportPolicy(defaultTransportPolicy, args.policy);

  const context: TransportContext = {
    rpcEndpoints: {
      regular: getInnerRpcEndpoints(args.rpcEndpoints.regular, 'regular'),
      archival: getInnerRpcEndpoints(args.rpcEndpoints.archival, 'archival'),
    },
    transportPolicy,
  };

  return {
    sendRequest: createSendRequest(context),
  };
};
