export class NatError extends Error {
  public code: string;
  public name: string;

  constructor(
    args: {
      code: string;
      message: string;
      cause?: unknown;
    },
    name = 'NatError',
  ) {
    super(`[${args.code}] ${args.message}`, { cause: args.cause });
    this.name = name;
    this.code = args.code;
  }

  static is(e: unknown) {
    return (
      typeof e === 'object' &&
      (e as any)[Symbol.for(`near-api-ts.${this.name}`)] === true
    );
  }
}

const DefaultTransportErrorBrand = Symbol.for(
  'near-api-ts.DefaultTransportError',
);

export class DefaultTransportError extends NatError {
  readonly [DefaultTransportErrorBrand] = true;

  constructor(args: { code: string; message: string; cause?: unknown }) {
    super(args, 'DefaultTransportError');
  }
}

export const hasTransportErrorCode = (error: unknown, list: string[]) =>
  DefaultTransportError.is(error) &&
  list.includes((error as DefaultTransportError).code);
