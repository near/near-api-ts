/**
 * Utility type that conditionally includes a key in an object:
 *
 * - If `V` is `undefined`, the key `K` is optional and must never be provided
 *   (acts as a "poison pill" to exclude the field).
 * - Otherwise, the key `K` is required with value type `V`.
 *
 * Examples:
 * ```ts
 *  type A = KeyIf<'foo', string>; // => { foo: string }
 *  type B = KeyIf<'bar', undefined>; // => { bar?: never }
 *
 *  // When combined in an intersection:
 *  type C = KeyIf<'foo', string> & KeyIf<'bar', undefined>;
 *  // => { foo: string; bar?: never }
 * ```
 */
export type KeyIf<K extends PropertyKey, V> = [V] extends [undefined]
  ? { [P in K]?: never }
  : { [P in K]: V };

/**
 * Utility type that "prettifies" an object type for IDE hints.
 *
 * TypeScript often shows type aliases, intersections, and conditional types
 * in their raw form (e.g. `Result<SomeType>` or `A & B`) instead of expanding
 * them into a flat object structure.
 *
 * `Prettify<T>` remaps the properties of `T` into a new object type,
 * effectively "flattening" the type so that IDE hovers display a clean,
 * expanded shape.
 *
 * Notice: it doesn't touch the nested types - to do it you need to use a recursive type.
 *
 * Examples:
 * ```ts
 * type Raw = { a: number } & { b: string };
 * // Hover shows: { a: number } & { b: string }
 *
 * type Pretty = Prettify<Raw>;
 * // Hover shows: { a: number; b: string }
 * ```
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};


/**
 * Stricter version of the built-in `Exclude<T, U>`.
 *
 * The standard `Exclude` accepts any `U`, even values that are not part of `T`,
 * which silently allows typos or stale members to pass type-checking.
 * `ExcludeStrict` constrains `U extends T`, so the compiler errors when you try
 * to exclude something that isn't actually a member of `T`.
 *
 * Examples:
 * ```ts
 * type Status = 'pending' | 'done' | 'failed';
 *
 * type A = Exclude<Status, 'done' | 'unknown'>;       // OK — 'unknown' is silently ignored
 * type B = ExcludeStrict<Status, 'done' | 'unknown'>; // Error — 'unknown' is not in Status
 * type C = ExcludeStrict<Status, 'done'>;             // => 'pending' | 'failed'
 * ```
 */
export type ExcludeStrict<T, U extends T> = Exclude<T, U>;
