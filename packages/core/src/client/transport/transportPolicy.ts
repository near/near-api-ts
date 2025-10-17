import type { TransportPolicy } from 'nat-types/client/transport';
import type { PartialDeep } from 'type-fest';
import { cloneDeep, mergeWith } from 'lodash-es';

export const defaultTransportPolicy: TransportPolicy = {
  rpcTypePreferences: ['Regular', 'Archival'],
  timeouts: {
    requestMs: 30_000,
    attemptMs: 1000,
  },
  retry: {
    maxAttempts: 2,
    backoff: {
      minDelayMs: 100,
      maxDelayMs: 100,
      multiplier: 3,
    },
  },
  failover: {
    maxRounds: 2,
    nextRpcDelayMs: 100,
    nextRoundDelayMs: 100,
  },
};

export const mergeTransportPolicy = (
  base: TransportPolicy,
  next: PartialDeep<TransportPolicy> = {},
): TransportPolicy =>
  mergeWith(
    {},
    cloneDeep(base),
    cloneDeep(next),
    (_objValue, srcValue, key) => {
      if (key === 'rpcTypePreferences' && Array.isArray(srcValue)) {
        return srcValue;
      }
    },
  );
