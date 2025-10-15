import type { PartialDeep } from 'type-fest';
import type { Milliseconds } from 'nat-types/common';

export type RpcType = 'regular' | 'archival';
type RegularFirst = ['regular', 'archival'];
type ArchivalFirst = ['archival', 'regular'];

export type RpcTypePreferences = RegularFirst | ArchivalFirst | [RpcType];

export type RequestPolicy = {
  rpcTypePreferences: RpcTypePreferences;
  timeouts: {
    totalMs: Milliseconds;
    attemptMs: Milliseconds;
  };
  maxFullRounds: number;
  rpcRetry: {
    maxAttempts: number;
    backoff: {
      minDelayMs: Milliseconds;
      maxDelayMs: Milliseconds;
      multiplier: number;
    };
  };
  nextRpcDelayMs: Milliseconds;
};

export type RpcEndpoint = {
  url: string;
  headers?: Record<string, string>;
};

type OnlyRegularType = {
  regular: RpcEndpoint[];
  archival?: never;
};

type OnlyArchivalType = {
  regular?: never;
  archival: RpcEndpoint[];
};

type BothTypes = {
  regular: RpcEndpoint[];
  archival: RpcEndpoint[];
};

export type RpcEndpoints = BothTypes | OnlyRegularType | OnlyArchivalType;

export type DefaultTransportArgs = {
  rpcEndpoints: RpcEndpoints;
  requestPolicy?: PartialDeep<RequestPolicy>;
};

export type InnerRpcEndpoint = {
  url: string;
  headers: Record<string, string>;
  type: RpcType;
  inactiveUntil: number | null;
};

export type DefaultTransportContext = {
  rpcEndpoints: {
    regular: InnerRpcEndpoint[];
    archival: InnerRpcEndpoint[];
  };
  readonly requestPolicy: RequestPolicy;
};
