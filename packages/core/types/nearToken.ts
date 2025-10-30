import type { Tokens, Units } from 'nat-types/common';

export type YoctoNearInputAmount = Units;
export type NearInputAmount = Tokens;

export type NearTokenArgs =
  | { near: NearInputAmount }
  | { yoctoNear: YoctoNearInputAmount };

export type YoctoNear = bigint;
export type Near = string;

export type NearToken = Readonly<{
  yoctoNear: YoctoNear;
  near: Near;
  add: (value: NearTokenArgs | NearToken) => NearToken;
  sub: (value: NearTokenArgs | NearToken) => NearToken;
  mul: (value: NearTokenArgs | NearToken) => NearToken;
  gt: (value: NearTokenArgs | NearToken) => boolean;
  lt: (value: NearTokenArgs | NearToken) => boolean;
}>;
