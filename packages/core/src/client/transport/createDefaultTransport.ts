import { createSendRequest } from './sendRequest/createSendRequest';
import type {
  DefaultTransportArgs,
  DefaultTransportContext,
  RpcEndpoint,
  RpcEndpoints,
  InnerRpcEndpoint,
  RpcTypePreferences,
  RpcType,
} from 'nat-types/client/transport/defaultTransport';
import { defaultRequestPolicy, mergeRequestPolicy } from './requestPolicy';
import { DefaultTransportError } from './defaultTransportError';

const getRpcs = (list: RpcEndpoint[] = [], type: RpcType): InnerRpcEndpoint[] =>
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
  const preferredList = rpcEndpoints[rpcTypePreferences[0]] ?? [];

  if (rpcTypePreferences.length === 1 && preferredList.length === 0)
    throw new DefaultTransportError({
      code: 'E1010',
      message:
        `Invalid transport configuration: no "${rpcTypePreferences[0]}" RPC endpoints found ` +
        `while it's the only preferred type.`,
    });
};

export const createDefaultTransport = (args: DefaultTransportArgs) => {
  const requestPolicy = mergeRequestPolicy(
    defaultRequestPolicy,
    args.requestPolicy,
  );

  validateRpcEndpoints(args.rpcEndpoints, requestPolicy.rpcTypePreferences);

  const context: DefaultTransportContext = {
    rpcEndpoints: {
      regular: getRpcs(args.rpcEndpoints.regular, 'regular'),
      archival: getRpcs(args.rpcEndpoints.archival, 'archival'),
    },
    requestPolicy,
  };

  return {
    sendRequest: createSendRequest(context),
  };
};
