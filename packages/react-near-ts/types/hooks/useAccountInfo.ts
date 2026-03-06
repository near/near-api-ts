import type {
  AccountId,
  GetAccountInfoOutput,
  GetAccountInfoError,
  BlockReference,
  PartialTransportPolicy,
} from 'near-api-ts';
import type { UseQueryResult } from '@tanstack/react-query';

type UseAccountInfoArgs = {
  accountId?: AccountId;
  atMomentOf?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  query?: {
    enabled?: boolean;
  };
};

export type UseAccountInfo = (
  args: UseAccountInfoArgs,
) => UseQueryResult<GetAccountInfoOutput, GetAccountInfoError>;
