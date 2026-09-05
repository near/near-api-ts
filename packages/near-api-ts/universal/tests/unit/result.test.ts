import { describe, expect, it } from 'vitest';
import { result, resultNatError } from '../../src/_common/_common/_common/result';
import { asThrowable } from '../../src/_common/_common/asThrowable';
import { wrapInternalError } from '../../src/_common/_common/wrapInternalError';

describe('Result', () => {
  it.each([false, 0, '', null, undefined, { data: 'nested', error: 'domain error' }])(
    'preserves successful data %j in safe and throwing APIs',
    async (data) => {
      const outcome = result.ok(data);

      expect(outcome).toStrictEqual({ success: true, data });
      expect(outcome).not.toHaveProperty('error');
      expect(asThrowable(() => outcome)()).toBe(data);
      await expect(asThrowable(async () => outcome)()).resolves.toBe(data);
    },
  );

  it.each([new Error('failed'), false, 0, '', null, undefined])(
    'preserves error %j without a data property',
    (error) => {
      const outcome = result.err(error);

      expect(outcome).toStrictEqual({ success: false, error });
      expect(outcome.error).toBe(error);
      expect(outcome).not.toHaveProperty('data');
    },
  );

  it('throws the original error synchronously', () => {
    expect.assertions(1);
    const error = new Error('failed');
    const throwing = asThrowable(() => result.err(error));

    try {
      throwing();
    } catch (caught) {
      expect(caught).toBe(error);
    }
  });

  it('rejects with the original error asynchronously', async () => {
    const error = new Error('failed');
    const throwing = asThrowable(async () => result.err(error));

    await expect(throwing()).rejects.toBe(error);
  });

  it('creates NatError failures with the new shape', () => {
    const cause = new Error('failed');
    const outcome = resultNatError('CreateNearGas.Internal', { cause });

    expect(outcome).toStrictEqual({ success: false, error: outcome.error });
    expect(outcome.error.kind).toBe('CreateNearGas.Internal');
    expect(outcome.error.context.cause).toBe(cause);
  });

  it('wraps unexpected synchronous and asynchronous errors with the new shape', async () => {
    const cause = new Error('failed');
    const sync = wrapInternalError('CreateNearGas.Internal', (): void => {
      throw cause;
    });
    const async = wrapInternalError('CreateNearGas.Internal', async () => {
      throw cause;
    });

    for (const outcome of [sync(), await async()]) {
      expect(outcome).toStrictEqual({ success: false, error: outcome?.error });
      expect(outcome?.error.kind).toBe('CreateNearGas.Internal');
      expect(outcome?.error.context.cause).toBe(cause);
    }
  });
});
