import type { BlockReference } from '../../../_common/common';
import type { ClientContext } from '../../client';
import type { TemporaryProtocolConfig } from '../../../../src/client/methods/protocol/getProtocolConfig';
import type { PartialTransportPolicy } from '../../transport/transport';

type GetProtocolConfigArgs = {
  atMomentOf?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetProtocolConfigResult = TemporaryProtocolConfig;

export type GetProtocolConfig = (
  args?: GetProtocolConfigArgs,
) => Promise<GetProtocolConfigResult>;

export type CreateGetProtocolConfig = (
  clientContext: ClientContext,
) => GetProtocolConfig;
