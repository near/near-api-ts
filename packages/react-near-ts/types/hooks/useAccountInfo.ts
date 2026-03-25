import type { UseQueryResult } from '@tanstack/react-query';
import type {
  AccountId,
  BlockReference,
  GetAccountInfoError,
  GetAccountInfoOutput,
  PartialTransportPolicy,
} from 'near-api-ts';

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
