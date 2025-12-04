import type { PartialDeep } from 'type-fest';
import type { JsonLikeValue, Milliseconds } from 'nat-types/_common/common';
import type { TransportError } from '../../src/client/transport/transportError';
import type { RpcError } from '../../src/client/rpcError';

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
  rpc: {
    maxAttempts: number;
    retryBackoff: {
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
  inactiveUntil: number | null; // TODO remove - we don't use it anymore
};

export type TransportContext = {
  readonly rpcEndpoints: {
    regular: InnerRpcEndpoint[];
    archival: InnerRpcEndpoint[];
  };
  readonly transportPolicy: TransportPolicy;
};

export type SendRequestContext = {
  transportPolicy: TransportPolicy;
  method: string;
  params: JsonLikeValue;
  requestTimeoutSignal: AbortSignal;
  externalAbortSignal?: AbortSignal;
  errors: (TransportError | RpcError)[];
};

export type RpcRequestLog = {
  url: string;
  rpcType: InnerRpcEndpoint['type'];
  method: string;
  headers: Record<string, string>;
  body: unknown;
  roundIndex: number;
  attemptIndex: number;
};

export type SendRequest = (args: {
  method: string;
  params: JsonLikeValue;
  transportPolicy?: PartialTransportPolicy;
  signal?: AbortSignal;
}) => Promise<unknown>;
