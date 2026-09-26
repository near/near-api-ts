import type { TemporaryProtocolConfig } from '../../../../src/createClient/methods/protocol/getProtocolConfig';
import type { BlockReference } from '../../../_common/common';
import type { ClientContext } from '../../client';
import type { PartialTransportPolicy } from '../../transport/transport';

type GetProtocolConfigArgs = {
  atMomentOf?: BlockReference;
  options?: {
    transportPolicy?: PartialTransportPolicy;
    signal?: AbortSignal;
  };
};

export type GetProtocolConfigResult = TemporaryProtocolConfig;

export type GetProtocolConfig = (args?: GetProtocolConfigArgs) => Promise<GetProtocolConfigResult>;

export type CreateGetProtocolConfig = (clientContext: ClientContext) => GetProtocolConfig;
