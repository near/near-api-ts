const NatErrorBrand = Symbol('NatError');

export class NatError<K extends NatErrorKind = NatErrorKind> extends Error {
  public readonly kind: K;
  public readonly context: ContextFor<K>;

  constructor(args: NatErrorArgs<K>) {
    super(args.message);
    this.name = 'NatError';
    this.kind = args.kind;
    this.context = args.context;
  }
}


export const NAT_KINDS = [
  'Client.GetAccountInfo.InvalidArgsSchema',
  'Client.SendSignedTransaction.Rpc.Transaction.NotEnoughBalance',
  'MemorySigner.ExecuteTransaction.Rpc.Transaction.NotEnoughBalance',
] as const;

export type NatErrorKind = (typeof NAT_KINDS)[number];


type ValidationIssue = { path: string; message: string; code?: string };

type ContextFor<K extends string> =
  // *.InvalidArgsSchema
  K extends `${string}.InvalidArgsSchema`
    ? { issues: ValidationIssue[]; raw?: unknown }
    : // *.Rpc.InvalidRequestSchema
      K extends `${string}.Rpc.InvalidRequestSchema`
      ? { field?: string; details?: string; raw?: unknown }
      : // *.Rpc.InternalError
        K extends `${string}.Rpc.InternalError`
        ? { code?: number; message?: string; data?: unknown }
        : // *.Rpc.Timeout
          K extends `${string}.Rpc.Timeout`
          ? {
              endpoint: string;
              attempt: number;
              timeoutMs: number;
              cause?: unknown;
            }
          : // *.Rpc.Transaction.NotEnoughBalance
            K extends `${string}.Rpc.Transaction.NotEnoughBalance`
            ? {
                accountId: string;
                required: bigint | string;
                available: bigint | string;
              }
            : // *.Rpc.Transaction.Action.FunctionCall.ExecutionError
              K extends `${string}.Rpc.Transaction.Action.FunctionCall.ExecutionError`
              ? {
                  txHash?: string;
                  status?: unknown;
                  logs?: string[];
                  errorText: string;
                }
              : // *.MemoryKeyService.PrivateKeyNotFound
                K extends `${string}.MemoryKeyService.PrivateKeyNotFound`
                ? { accountId: string; publicKey?: string }
                : unknown;


export type NatErrorArgs<K extends NatErrorKind> = {
  kind: K;
  message: string;
  context: ContextFor<K>;
};

// const x = new NatError({
//  kind: 'Client.SendSignedTransaction.Rpc.Transaction.NotEnoughBalance'
// });
