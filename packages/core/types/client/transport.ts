import type { PartialDeep } from 'type-fest';
import type { Milliseconds } from 'nat-types/common';

export type RpcType = 'Regular' | 'Archival';
type RegularFirst = ['Regular', 'Archival'];
type ArchivalFirst = ['Archival', 'Regular'];

export type RpcTypePreferences = RegularFirst | ArchivalFirst | [RpcType];

export type TransportPolicy = {
  rpcTypePreferences: RpcTypePreferences;
  timeouts: {
    requestMs: Milliseconds;
    attemptMs: Milliseconds;
  };
  retry: {
    maxAttempts: number;
    backoff: {
      minDelayMs: Milliseconds;
      maxDelayMs: Milliseconds;
      multiplier: number;
    };
  };
  failover: {
    maxRounds: number;
    nextRpcDelayMs: Milliseconds;
    nextRoundDelayMs: Milliseconds;
  };
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

export type PartialTransportPolicy = PartialDeep<TransportPolicy>;

export type CreateTransportArgs = {
  rpcEndpoints: RpcEndpoints;
  policy?: PartialTransportPolicy;
};

export type InnerRpcEndpoint = {
  url: string;
  headers: Record<string, string>;
  type: 'regular' | 'archival';
  inactiveUntil: number | null;
};

export type TransportContext = {
  readonly rpcEndpoints: {
    regular: InnerRpcEndpoint[];
    archival: InnerRpcEndpoint[];
  };
  readonly transportPolicy: TransportPolicy;
};
