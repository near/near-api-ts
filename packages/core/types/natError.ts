import type { FromCurveStringErrors } from 'nat-types/_common/transformers/fromCurveString';

type A =
  | {
      kind: 'Client.GetAccountInfo.InvalidArgsSchema';
      context: { a1: number };
    }
  | {
      kind: 'Client.GetAccountInfo.Unknown';
      context: { c1: number };
    };

type B = {
  kind: 'Client.SendSignedTransaction.Rpc.Transaction.NotEnoughBalance';
  context: { a2: number };
};

type NatErrorMap = FromCurveStringErrors | A | B;

export type Kind = NatErrorMap['kind'];

export type ContextFor<K extends Kind> = Extract<
  NatErrorMap,
  { kind: K }
>['context'];

export type CreateNatErrorArgs<K extends Kind> = {
  kind: K;
  context: ContextFor<K>;
  message?: string;
};
