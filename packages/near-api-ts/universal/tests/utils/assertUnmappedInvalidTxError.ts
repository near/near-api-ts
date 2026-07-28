import { expect } from 'vitest';
import type { Result } from '../../types/_common/common';

const THROWN_ERROR_PREFIX = 'Unexpected invalidTxError: ';

/**
 * `getConversionFailureError` throws on the `InvalidTxError` variants it doesn't map yet,
 * so `safeSendSignedTransaction` reports them as `Client.SendSignedTransaction.Internal`
 * carrying the thrown error in `context.cause`. Assert the raw (camel-cased) nearcore
 * payload of that error until the variant gets its own
 * `Client.SendSignedTransaction.Rpc.*` error.
 */
export const assertUnmappedInvalidTxError = <E extends { kind: string; context: unknown }>(
  res: Result<unknown, E>,
  invalidTxError: unknown,
) => {
  expect(res.ok).toBe(false);
  if (res.ok) return;

  expect(res.error.kind).toBe('Client.SendSignedTransaction.Internal');

  const { cause } = res.error.context as { cause: unknown };
  expect(cause).toBeInstanceOf(Error);

  const { message } = cause as Error;
  expect(message.startsWith(THROWN_ERROR_PREFIX)).toBe(true);
  expect(JSON.parse(message.slice(THROWN_ERROR_PREFIX.length))).toStrictEqual(invalidTxError);
};
