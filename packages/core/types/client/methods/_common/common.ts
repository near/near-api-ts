import type {
  InvalidSchemaContext,
  UnknownErrorContext,
} from 'nat-types/natError';

export type CommonRpcMethodErrorVariant<Prefix extends string> =
  | {
      kind: `${Prefix}.Args.InvalidSchema`;
      context: InvalidSchemaContext;
    }
  | {
      kind: `${Prefix}.Rpc.Internal`;
      context: { message: string };
    }
  | {
      kind: `${Prefix}.Unknown`;
      context: UnknownErrorContext;
    };
