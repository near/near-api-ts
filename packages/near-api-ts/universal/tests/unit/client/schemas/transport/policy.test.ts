import { defaultTransportPolicy, PartialTransportPolicySchema } from '@universal/src/client/transport/transportPolicy';
import type { PartialTransportPolicy } from '@universal/types/client/transport/transport';
import { describe, expect, it } from 'vitest';
import * as z from 'zod/mini';

z.config(z.locales.en());

describe('Ok', () => {
  it('defaultTransportPolicy', async () => {
    const res = PartialTransportPolicySchema.safeParse(defaultTransportPolicy);
    expect(res.success).toBe(true);
  });

  it('rpcTypePreferences', async () => {
    const x: PartialTransportPolicy = {
      rpcTypePreferences: ['Archival'],
    };
    const res = PartialTransportPolicySchema.safeParse(x);
    expect(res.success).toBe(true);
  });
});

describe('Error', () => {
  it('rpcTypePreferences', async () => {
    const x: PartialTransportPolicy = {
      // @ts-expect-error
      rpcTypePreferences: [],
    };
    const res = PartialTransportPolicySchema.safeParse(x);
    expect(res.success).toBe(false);
  });
  // retryBackoff
  it('timeouts.requestMs', async () => {
    const x: PartialTransportPolicy = {
      timeouts: {
        requestMs: 50, // should be >= 100ms
      },
    };
    const res = PartialTransportPolicySchema.safeParse(x);
    console.log(res);
    expect(res.success).toBe(false);
  });

  it('rpc.retryBackoff.multiplier', async () => {
    const x: PartialTransportPolicy = {
      rpc: {
        retryBackoff: {
          multiplier: 0, // should be >= 1
        },
      },
    };
    const res = PartialTransportPolicySchema.safeParse(x);
    console.log(res);
    expect(res.success).toBe(false);
  });
});
