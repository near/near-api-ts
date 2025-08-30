import type { BlockReference } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

type GetProtocolConfigArgs = {
  blockReference?: BlockReference;
};

export type GetProtocolConfigResult = unknown;

export type GetProtocolConfig = (
  args?: GetProtocolConfigArgs,
) => Promise<GetProtocolConfigResult>;

export type CreateGetProtocolConfig = (
  clientContext: ClientContext,
) => GetProtocolConfig;
