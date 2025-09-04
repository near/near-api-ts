export type FnArgsJson<Args> = { fnArgsJson: Args; fnArgsBytes?: never };
export type FnArgsBytes = { fnArgsJson?: never; fnArgsBytes?: Uint8Array };

export type FnArgs<Args> = FnArgsBytes | FnArgsJson<Args>
