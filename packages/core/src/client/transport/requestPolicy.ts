import type { RequestPolicy } from 'nat-types/client/transport/defaultTransport';
import type { PartialDeep } from 'type-fest';
import { cloneDeep, mergeWith } from 'lodash-es';

export const defaultRequestPolicy: RequestPolicy = {
  rpcTypePreferences: ['regular', 'archival'],
  timeouts: {
    totalMs: 30_000,
    attemptMs: 1000,
  },
  maxRounds: 2,
  rpcRetry: {
    maxAttempts: 2,
    backoff: {
      minDelayMs: 100,
      maxDelayMs: 1000,
      multiplier: 3,
    },
  },
  nextRpcDelayMs: 500,
};

export const mergeRequestPolicy = (
  base: RequestPolicy,
  next: PartialDeep<RequestPolicy> = {},
): RequestPolicy =>
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
