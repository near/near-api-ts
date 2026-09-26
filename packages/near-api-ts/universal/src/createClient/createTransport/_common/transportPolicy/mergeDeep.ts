import type { PartialDeep } from '../../../../../types/utils';

type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Deep merge of JSON-like data into a new object:
 * - nested plain objects are merged key by key;
 * - arrays and primitives from `next` replace the base value as a whole;
 * - `undefined` in `next` keeps the base value.
 *
 * Neither argument is mutated, but subtrees `next` doesn't touch are shared
 * with `base` — clone the arguments first if the result must be independent.
 */
export const mergeDeep = <T extends PlainObject>(base: T, next: NoInfer<PartialDeep<T>>): T => {
  const merged: PlainObject = { ...base };

  for (const [key, value] of Object.entries(next)) {
    if (value === undefined) continue;
    const current = merged[key];
    merged[key] =
      isPlainObject(current) && isPlainObject(value) ? mergeDeep(current, value) : value;
  }

  return merged as T;
};
