import type {
  NatErrorKind,
  CreateNatErrorArgs,
  ContextFor,
} from 'nat-types/natError';

export const NatErrorBrand = Symbol('NatError');

export class NatError<K extends NatErrorKind> extends Error {
  public readonly [NatErrorBrand] = true;
  public readonly kind: K;
  public readonly context: ContextFor<K>;

  constructor(args: CreateNatErrorArgs<K>) {
    super(`<${args.kind}>}`);
    this.name = 'NatError';
    this.kind = args.kind;
    this.context = args.context;
  }
}

export const createNatError = <K extends NatErrorKind>(
  args: CreateNatErrorArgs<K>,
): NatError<K> => new NatError(args);

// TODO Add safe version
export const isNatError = <K extends NatErrorKind>(
  error: unknown,
  kind?: K,
): error is NatError<K> => {
  const isNatErr =
    typeof error === 'object' && error !== null && NatErrorBrand in error;

  if (kind === undefined) return isNatErr;
  return isNatErr && (error as NatError<K>)?.kind === kind;
};
