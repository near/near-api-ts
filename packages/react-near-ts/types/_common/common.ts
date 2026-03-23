export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type DistributiveOmit<TObject, TKey extends keyof TObject> = TObject extends unknown
  ? Omit<TObject, TKey>
  : never;
