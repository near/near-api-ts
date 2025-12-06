import type { BlockReference } from 'nat-types/_common/common';
import type { ClientContext } from 'nat-types/client/client';
import type { TemporaryProtocolConfig } from '../../../../src/client/methods/protocol/getProtocolConfig';
import type { PartialTransportPolicy } from 'nat-types/client/transport/transport';

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
