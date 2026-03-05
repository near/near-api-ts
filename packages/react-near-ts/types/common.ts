export type KeyIf<K extends PropertyKey, V> = [V] extends [undefined]
  ? { [P in K]?: never }
  : { [P in K]: V };
