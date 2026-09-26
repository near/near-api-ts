import type {
  PartialTransportPolicy,
  TransportPolicy,
} from '../../../../../types/client/transport/transport';
import { cloneDeep } from './cloneDeep';
import { mergeDeep } from './mergeDeep';

export const defaultTransportPolicy: TransportPolicy = {
  rpcTypePreferences: ['Regular', 'Archival'],
  timeouts: {
    requestMs: 30_000,
    attemptMs: 5_000,
  },
  rpc: {
    maxAttempts: 2,
    retryBackoff: {
      minDelayMs: 100,
      maxDelayMs: 500,
      multiplier: 3,
    },
  },
  failover: {
    maxRounds: 2,
    nextRpcDelayMs: 200,
    nextRoundDelayMs: 200,
  },
};

export const mergeTransportPolicy = (
  base: TransportPolicy,
  next: PartialTransportPolicy = {},
): TransportPolicy => mergeDeep(cloneDeep(base), cloneDeep(next));
