import { getBlockTarget } from '../utils.js';
import type { BlockTarget } from '@near-api-ts/types';
import type { SendRequest } from '../../createSendRequest.js';

// https://docs.near.org/api/rpc/protocol#protocol-config

type GetProtocolConfigArgs = {
  options?: BlockTarget;
};

// TODO use generated type
type GetProtocolConfigResult = object;

type GetProtocolConfig = (
  args?: GetProtocolConfigArgs,
) => Promise<GetProtocolConfigResult>;

export const createGetProtocolConfig =
  (sendRequest: SendRequest): GetProtocolConfig =>
  ({ options } = {}) =>
    sendRequest({
      body: {
        method: 'EXPERIMENTAL_protocol_config',
        params: getBlockTarget(options),
      },
    });
