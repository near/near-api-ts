import type { BlockTarget } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

type Input = {
  options?: BlockTarget;
};

export type Output = any;

export type GetProtocolConfig = (input: Input) => Promise<Output>;

export type CreateGetProtocolConfig = (
  clientContext: ClientContext,
) => GetProtocolConfig;
