import * as z from 'zod/mini';

export const Regular = z.literal('Regular');

const Archival = z.literal('Archival');

const RpcTypePreferencesZodSchema = z.union([
  z.tuple([Regular]),
  z.tuple([Archival]),
  z.tuple([Regular, Archival]),
  z.tuple([Archival, Regular]),
]);

const TransportPolicyZodSchema = z.object({
  rpcTypePreferences: RpcTypePreferencesZodSchema,
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

export const PartialTransportPolicyZodSchema = z.optional(z.partial(TransportPolicyZodSchema));
