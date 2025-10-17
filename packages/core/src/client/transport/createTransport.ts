import { createSendRequest } from './sendRequest/createSendRequest';
import type {
  CreateTransportArgs,
  TransportContext,
  RpcEndpoint,
  RpcEndpoints,
  InnerRpcEndpoint,
  RpcTypePreferences,
} from 'nat-types/client/transport';
import {
  defaultTransportPolicy,
  mergeTransportPolicy,
} from './transportPolicy';
import { TransportError } from './transportError';

const getRpcs = (
  list: RpcEndpoint[] = [],
  type: 'regular' | 'archival',
): InnerRpcEndpoint[] =>
  list.map((rpc) => ({
    type,
    url: rpc.url,
    headers: {
      ...rpc.headers,
      'Content-Type': 'application/json',
    },
    inactiveUntil: null,
  }));

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
 */
const validateRpcEndpoints = (
  rpcEndpoints: RpcEndpoints,
  rpcTypePreferences: RpcTypePreferences,
) => {
  const preferredType =
    rpcTypePreferences[0] === 'Regular' ? 'regular' : 'archival';

  const preferredList = rpcEndpoints[preferredType] ?? [];

  if (rpcTypePreferences.length === 1 && preferredList.length === 0)
    throw new TransportError({
      code: 'InvalidTransportConfiguration',
      message:
        `Invalid transport configuration: no "${rpcTypePreferences[0]}" RPC endpoints found ` +
        `while it's the only preferred type.`,
    });
};

export const createTransport = (args: CreateTransportArgs) => {
  const transportPolicy = mergeTransportPolicy(
    defaultTransportPolicy,
    args.policy,
  );

  // TODO validate transportPolicy;
  validateRpcEndpoints(args.rpcEndpoints, transportPolicy.rpcTypePreferences);

  const context: TransportContext = {
    rpcEndpoints: {
      regular: getRpcs(args.rpcEndpoints.regular, 'regular'),
      archival: getRpcs(args.rpcEndpoints.archival, 'archival'),
    },
    transportPolicy,
  };

  return {
    sendRequest: createSendRequest(context),
  };
};
