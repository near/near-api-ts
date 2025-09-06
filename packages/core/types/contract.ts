import type { JsonLikeValue, MaybeJsonLikeValue } from 'nat-types/common';

export type FnArgsJson<AJ extends JsonLikeValue> = {
  fnArgsJson: AJ;
  fnArgsBytes?: never;
};
export type FnArgsBytes = { fnArgsJson?: never; fnArgsBytes?: Uint8Array };

export type FnArgs<AJ extends MaybeJsonLikeValue = undefined> = [AJ] extends [
  JsonLikeValue,
]
  ? FnArgsJson<AJ>
  : FnArgsBytes;
