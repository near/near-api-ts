export type KeyIf<K extends PropertyKey, V> = [V] extends [undefined]
  ? { [P in K]?: never }
  : { [P in K]: V };

export type ResultOk<V> = { ok: true; value: V };
export type ResultErr<E> = { ok: false; error: E };
export type Result<V, E> = ResultOk<V> | ResultErr<E>;
