import type { BlockId } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

type Input = {
  options?: {
    blockId?: BlockId;
  };
};

export type Output = {
  gasPrice: bigint; // TODO Fix!
};

export type GetGasPrice = (input: Input) => Promise<Output>;
export type CreateGetGasPrice = (clientContext: ClientContext) => GetGasPrice;
