import { createSendRequest } from './sendRequest/1-createSendRequest/createSendRequest';
import type {
  CreateTransport,
  TransportContext,
} from '../../../types/client/transport/transport';
import {
  defaultTransportPolicy,
  mergeTransportPolicy,
  PartialTransportPolicySchema,
} from './transportPolicy';
import * as z from 'zod/mini';
import { getInnerRpcEndpoints, RpcEndpointsArgsSchema } from './rpcEndpoints';

export const CreateTransportArgsSchema = z.object({
  rpcEndpoints: RpcEndpointsArgsSchema,
  policy: PartialTransportPolicySchema,
});

export const createTransport: CreateTransport = (args) => {
  const transportPolicy = mergeTransportPolicy(
    defaultTransportPolicy,
    args.policy,
  );

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

/**
 * Validates that the provided RPC endpoints match the specified RPC type preferences.
 *
 * Logic:
 * - If `rpcTypePreferences` contains only one type (e.g. "regular"),
 *   but there are no endpoints of that type in `rpcEndpoints`, the configuration is invalid.
 * - In all other cases (e.g. when two preferences are listed, or when the preferred type has endpoints),
 *   the configuration is considered valid.
 *
 * Example:
 * ```
 * ["regular"] <-> R = ok
 * ["regular"] <-> A = error
 * ```
 * means that if `rpcTypePreferences` is set to ["regular"], but there are no "regular"
 * RPC endpoints available, an error will be thrown.
 *
 * // TODO add in the future
 * // const validateRpcEndpoints = (args: CreateTransportArgs) => {
 * //   const { rpcEndpoints, policy } = args;
 * //   if (!policy?.rpcTypePreferences) return true;
 * //
 * //   const preferredType =
 * //     policy.rpcTypePreferences[0] === 'Regular' ? 'regular' : 'archival';
 * //
 * //   return !!rpcEndpoints[preferredType];
 * // };
 */
