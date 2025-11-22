import type { Kind, CreateNatErrorArgs, ContextFor } from 'nat-types/natError';

export const NatErrorBrand = Symbol('NatError');

export class NatError<K extends Kind> extends Error {
  public readonly [NatErrorBrand] = true;
  public readonly kind: K;
  public readonly context: ContextFor<K>;

  constructor(args: CreateNatErrorArgs<K>) {
    super(`<${args.kind}> ${args.message ?? ''}`);
    this.name = 'NatError';
    this.kind = args.kind;
    this.context = args.context;
  }

  static create<K extends Kind>(args: CreateNatErrorArgs<K>): NatError<K> {
    return new NatError(args);
  }
}

export const isNatError = <K extends Kind>(
  error: unknown,
  kind?: K,
): error is NatError<K> => {
  const isNatErr =
    typeof error === 'object' && error !== null && NatErrorBrand in error;

  if (kind === undefined) return isNatErr;
  return isNatErr && (error as NatError<K>).kind === kind;
};
