import type { PartialDeep } from 'type-fest';
import type { Milliseconds } from 'nat-types/_common/common';
import type {
  SendRequest,
  SendRequestErrorVariant,
} from 'nat-types/client/transport/sendRequest';

export type TransportErrorVariant = SendRequestErrorVariant;

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

export type InnerRpcEndpoint = {
  url: string;
  headers: Record<string, string>;
  type: 'regular' | 'archival';
};

export type TransportContext = {
  readonly rpcEndpoints: {
    regular: InnerRpcEndpoint[];
    archival: InnerRpcEndpoint[];
  };
  readonly transportPolicy: TransportPolicy;
};

export type CreateTransportArgs = {
  rpcEndpoints: RpcEndpoints;
  policy?: PartialTransportPolicy;
};

type Transport = {
  sendRequest: SendRequest;
};

export type CreateTransport = (args: CreateTransportArgs) => Transport;
