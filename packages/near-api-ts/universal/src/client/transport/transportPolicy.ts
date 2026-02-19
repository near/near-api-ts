import { cloneDeep, mergeWith } from 'lodash-es'; // TODO replace with embedded fn
import type { PartialDeep } from 'type-fest';
import * as z from 'zod/mini';
import type { TransportPolicy } from '../../../types/client/transport/transport';

const Regular = z.literal('Regular');
const Archival = z.literal('Archival');

const RpcTypePreferencesSchema = z.union([
  z.tuple([Regular]),
  z.tuple([Archival]),
  z.tuple([Regular, Archival]),
  z.tuple([Archival, Regular]),
]);

const TransportPolicySchema = z.object({
  rpcTypePreferences: RpcTypePreferencesSchema,
  timeouts: z.partial(
    z.object({
      // Unlikely that a request could finish less in than 100ms -
      // doesn't make sense to have such a small timeout
      requestMs: z.number().check(z.int(), z.minimum(100)),
      attemptMs: z.number().check(z.int(), z.minimum(100)),
    }),
  ),
  rpc: z.partial(
    z.object({
      maxAttempts: z.number().check(z.int(), z.minimum(1)),
      retryBackoff: z.partial(
        z.object({
          minDelayMs: z.number().check(z.int(), z.nonnegative()),
          maxDelayMs: z.number().check(z.int(), z.nonnegative()),
          multiplier: z.number().check(z.int(), z.minimum(1)),
        }),
      ),
    }),
  ),
  failover: z.partial(
    z.object({
      maxRounds: z.number().check(z.int(), z.minimum(1)),
      nextRpcDelayMs: z.number().check(z.int(), z.nonnegative()),
      nextRoundDelayMs: z.number().check(z.int(), z.nonnegative()),
    }),
  ),
});

export const PartialTransportPolicySchema = z.optional(
  z.partial(TransportPolicySchema),
);

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
