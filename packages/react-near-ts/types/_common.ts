export type KeyIf<K extends PropertyKey, V> = [V] extends [undefined]
  ? { [P in K]?: never }
  : { [P in K]: V };

export type ResultOk<D> = { success: true; data: D; error?: never };
export type ResultErr<E> = { success: false; error: E; data?: never };
export type Result<D, E> = ResultOk<D> | ResultErr<E>;

// TODO move to _common folder
