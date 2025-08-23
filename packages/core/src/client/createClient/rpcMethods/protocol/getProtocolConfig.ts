import { getBlockTarget } from '../utils';
import type { CreateGetProtocolConfig } from 'nat-types/client/rpcMethods/protocol/getProtocolConfig';

export const createGetProtocolConfig: CreateGetProtocolConfig =
  ({ sendRequest }) =>
  ({ options } = {}) =>
    sendRequest({
      body: {
        method: 'EXPERIMENTAL_protocol_config',
        params: getBlockTarget(options),
      },
    });
