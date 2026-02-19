import { RpcEndpointsArgsSchema } from '@universal/src/client/transport/rpcEndpoints';
import type { RpcEndpoints } from '@universal/types/client/transport/transport';
import { describe, expect, it } from 'vitest';
import * as z from 'zod/mini';

z.config(z.locales.en());

describe('Ok', () => {
  it('1 regular', async () => {
    const x: RpcEndpoints = {
      regular: [{ url: 'http://localhost:8080' }],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    expect(res.success).toBe(true);
  });

  it('1 archival', async () => {
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

  it('1 regular + 1 archival', async () => {
    const x: RpcEndpoints = {
      regular: [{ url: 'http://localhost:8080' }],
      archival: [{ url: 'http://localhost:8080' }],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    expect(res.success).toBe(true);
  });
});

describe('Error', () => {
  it('empty regular', async () => {
    const x: RpcEndpoints = {
      regular: [],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    expect(res.success).toBe(false);
  });

  it('empty regular + valid archival', async () => {
    const x: RpcEndpoints = {
      regular: [],
      archival: [{ url: 'http://localhost:8080' }],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    console.log(res);
    expect(res.success).toBe(false);
  });

  it('null regular + valid archival', async () => {
    const x: RpcEndpoints = {
      // @ts-expect-error
      regular: 'invalid',
      archival: [{ url: 'http://localhost:8080' }],
    };
    const res = RpcEndpointsArgsSchema.safeParse(x);
    expect(res.success).toBe(false);
  });
});
