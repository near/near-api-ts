export type FnArgsJson<A> = { fnArgsJson: A; fnArgsBytes?: never };
export type FnArgsBytes = { fnArgsJson?: never; fnArgsBytes?: Uint8Array };

export type FnArgs<A = undefined> = [A] extends [undefined]
  ? FnArgsBytes
  : FnArgsJson<A>;
