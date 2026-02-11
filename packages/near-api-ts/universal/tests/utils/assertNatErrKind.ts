import type { Result, ResultErr } from '../../types/_common/common';
import { expect } from 'vitest';

export function assertNatErrKind<T, E extends { kind: string }>(
  res: Result<T, E>,
  kind: E['kind'],
): asserts res is ResultErr<E> {
  expect(res.ok).toBe(false);
  if (!res.ok) {
    expect(res.error.kind).toBe(kind);
  }
}
