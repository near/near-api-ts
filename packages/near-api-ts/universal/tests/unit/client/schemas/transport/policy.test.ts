import { describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import {
  defaultTransportPolicy,
  PartialTransportPolicyZodSchema,
} from '../../../../../src/client/transport/transportPolicy';
import type { PartialTransportPolicy } from '../../../../../types/client/transport/transport';

z.config(z.locales.en());

describe('transportPolicy schema › valid', () => {
  it('accepts the default transport policy', async () => {
    const res = PartialTransportPolicyZodSchema.safeParse(defaultTransportPolicy);
    expect(res.success).toBe(true);
  });

  it('accepts archival rpcTypePreferences', async () => {
    const x: PartialTransportPolicy = {
      rpcTypePreferences: ['Archival'],
    };
    const res = PartialTransportPolicyZodSchema.safeParse(x);
    expect(res.success).toBe(true);
  });
});

describe('transportPolicy schema › invalid', () => {
  it('rejects an empty rpcTypePreferences list', async () => {
    const x: PartialTransportPolicy = {
      // @ts-expect-error
      rpcTypePreferences: [],
    };
    const res = PartialTransportPolicyZodSchema.safeParse(x);
    expect(res.success).toBe(false);
  });
  // retryBackoff
  it('rejects a requestMs below the minimum', async () => {
    const x: PartialTransportPolicy = {
      timeouts: {
        requestMs: 50, // should be >= 100ms
      },
    };
    const res = PartialTransportPolicyZodSchema.safeParse(x);
    console.log(res);
    expect(res.success).toBe(false);
  });

  it('rejects a retry backoff multiplier below 1', async () => {
    const x: PartialTransportPolicy = {
      rpc: {
        retryBackoff: {
          multiplier: 0, // should be >= 1
        },
      },
    };
    const res = PartialTransportPolicyZodSchema.safeParse(x);
    console.log(res);
    expect(res.success).toBe(false);
  });
});
