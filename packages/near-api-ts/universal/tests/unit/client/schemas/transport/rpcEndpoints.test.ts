import { describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import { RpcEndpointsArgsSchema } from '../../../../../src/client/transport/rpcEndpoints';
import type { RpcEndpoints } from '../../../../../types/client/transport/transport';

z.config(z.locales.en());

describe('rpcEndpoints schema › valid', () => {
  it('accepts a single regular endpoint', async () => {
    const x: RpcEndpoints = {
      regular: [{ url: 'http://localhost:8080' }],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    expect(res.success).toBe(true);
  });

  it('accepts a single archival endpoint with headers', async () => {
    const x: RpcEndpoints = {
      archival: [
        {
          url: 'http://localhost:8080',
          headers: { a: '1' },
        },
      ],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    expect(res.success).toBe(true);
  });

  it('accepts both regular and archival endpoints', async () => {
    const x: RpcEndpoints = {
      regular: [{ url: 'http://localhost:8080' }],
      archival: [{ url: 'http://localhost:8080' }],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    expect(res.success).toBe(true);
  });
});

describe('rpcEndpoints schema › invalid', () => {
  it('rejects an empty regular list', async () => {
    const x: RpcEndpoints = {
      regular: [],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    expect(res.success).toBe(false);
  });

  it('rejects an empty regular list even with valid archival', async () => {
    const x: RpcEndpoints = {
      regular: [],
      archival: [{ url: 'http://localhost:8080' }],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    console.log(res);
    expect(res.success).toBe(false);
  });

  it('rejects a non-array regular value', async () => {
    const x: RpcEndpoints = {
      // @ts-expect-error
      regular: 'invalid',
      archival: [{ url: 'http://localhost:8080' }],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    expect(res.success).toBe(false);
  });
});
