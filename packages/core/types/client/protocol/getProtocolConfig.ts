import type { BlockReference } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';
import type { TemporaryProtocolConfig } from '../../../src/client/createClient/protocol/getProtocolConfig';

type GetProtocolConfigArgs = {
  blockReference?: BlockReference;
};

export type GetProtocolConfigResult = TemporaryProtocolConfig;

export type GetProtocolConfig = (
  args?: GetProtocolConfigArgs,
) => Promise<GetProtocolConfigResult>;

export type CreateGetProtocolConfig = (
  clientContext: ClientContext,
) => GetProtocolConfig;
