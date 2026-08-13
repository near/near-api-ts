import { cloneDeep, mergeWith } from 'lodash-es'; // TODO replace with embedded fn
import type { PartialDeep } from 'type-fest';
import type { TransportPolicy } from '../../../types/client/transport/transport';

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
  next: PartialDeep<TransportPolicy> = {},
): TransportPolicy =>
  mergeWith({}, cloneDeep(base), cloneDeep(next), (_objValue, srcValue, key) => {
    if (key === 'rpcTypePreferences' && Array.isArray(srcValue)) {
      return srcValue;
    }
  });
