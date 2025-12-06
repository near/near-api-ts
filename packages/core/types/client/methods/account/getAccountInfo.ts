import type {
  AccountId,
  CryptoHash,
  BlockHash,
  BlockHeight,
  BlockReference,
  Result,
} from 'nat-types/_common/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport/transport';
import type { NearToken } from 'nat-types/_common/nearToken';
import type { NatError } from '@common/natError';
import type {
  InvalidArgsContext,
  UnknownErrorContext,
} from 'nat-types/natError';

export type GetAccountInfoErrorVariant =
  | {
      kind: 'Client.GetAccountInfo.InvalidArgs';
      context: InvalidArgsContext;
    }
  | {
      kind: 'Client.GetAccountInfo.Unknown';
      context: UnknownErrorContext;
    };

export type GetAccountInfoUnknownErrorKind = 'Client.GetAccountInfo.Unknown';

export type GetAccountInfoArgs = {
  accountId: AccountId;
  atMomentOf?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetAccountInfoOutput = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountId: AccountId;
  accountInfo: {
    balance: {
      total: NearToken;
      locked: NearToken;
    };
    usedStorageBytes: number;
    contractHash?: CryptoHash;
    globalContractHash?: CryptoHash;
    globalContractAccountId?: AccountId;
  };
};

type GetAccountInfoError = NatError<any>;

export type SafeGetAccountInfo = (
  args: GetAccountInfoArgs,
) => Promise<Result<GetAccountInfoOutput, GetAccountInfoError>>;

export type GetAccountInfo = (
  args: GetAccountInfoArgs,
) => Promise<GetAccountInfoOutput>;

export type CreateSafeGetAccountInfo = (
  clientContext: ClientContext,
) => SafeGetAccountInfo;
