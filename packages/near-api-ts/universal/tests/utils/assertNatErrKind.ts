import { expect } from 'vitest';
import type { Result, ResultErr } from '../../types/_common/common';

export function assertNatErrKind<E extends { kind: string }, K extends E['kind']>(
  res: Result<unknown, E>,
  kind: K,
): asserts res is ResultErr<Extract<E, { kind: K }>> {
  expect(res.ok).toBe(false);
  if (!res.ok) {
    expect(res.error.kind).toBe(kind);
  }
}
