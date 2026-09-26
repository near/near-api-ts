/**
 * Deep copy of JSON-like data: plain objects, arrays and primitives.
 * Class instances (Date, Map, Uint8Array, …) are not supported — they come
 * back as plain objects.
 */
export const cloneDeep = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map((item) => cloneDeep(item)) as T;

  if (typeof value === 'object' && value !== null)
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneDeep(item)]),
    ) as T;

  return value;
};
