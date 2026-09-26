import { describe, expect, it } from 'vitest';
import {
  defaultTransportPolicy,
  mergeTransportPolicy,
} from '../../../../src/createClient/createTransport/_common/transportPolicy/transportPolicy';
import type { PartialTransportPolicy } from '../../../../types/client/transport/transport';

describe('mergeTransportPolicy', () => {
  it('returns the base policy when nothing is overridden', () => {
    expect(mergeTransportPolicy(defaultTransportPolicy)).toStrictEqual(defaultTransportPolicy);
    expect(mergeTransportPolicy(defaultTransportPolicy, {})).toStrictEqual(defaultTransportPolicy);
  });

  it('overrides a nested value and keeps its siblings', () => {
    const merged = mergeTransportPolicy(defaultTransportPolicy, {
      rpc: { retryBackoff: { multiplier: 5 } },
    });
    expect(merged.rpc).toStrictEqual({
      maxAttempts: 2,
      retryBackoff: { minDelayMs: 100, maxDelayMs: 500, multiplier: 5 },
    });
    expect(merged.timeouts).toStrictEqual(defaultTransportPolicy.timeouts);
  });

  it('replaces rpcTypePreferences as a whole instead of merging by index', () => {
    const merged = mergeTransportPolicy(defaultTransportPolicy, {
      rpcTypePreferences: ['Archival'],
    });
    expect(merged.rpcTypePreferences).toStrictEqual(['Archival']);
  });

  it('keeps the base value where the override is undefined', () => {
    const merged = mergeTransportPolicy(defaultTransportPolicy, {
      rpcTypePreferences: undefined,
      timeouts: { requestMs: undefined, attemptMs: 1000 },
      failover: undefined,
    });
    expect(merged).toStrictEqual({
      ...defaultTransportPolicy,
      timeouts: { requestMs: 30_000, attemptMs: 1000 },
    });
  });

  it('shares no references with its arguments', () => {
    const next: PartialTransportPolicy = {
      rpcTypePreferences: ['Archival', 'Regular'],
      failover: { maxRounds: 5 },
    };
    const merged = mergeTransportPolicy(defaultTransportPolicy, next);

    expect(merged.rpcTypePreferences).not.toBe(next.rpcTypePreferences);
    expect(merged.failover).not.toBe(next.failover);
    expect(merged.timeouts).not.toBe(defaultTransportPolicy.timeouts);
    expect(merged.rpc.retryBackoff).not.toBe(defaultTransportPolicy.rpc.retryBackoff);
  });
});
