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

const TransportErrorBrand = Symbol.for('near-api-ts.TransportError');

export class TransportError extends NatError {
  readonly [TransportErrorBrand] = true;

  constructor(args: { code: string; message: string; cause?: unknown }) {
    super(args, 'TransportError');
  }
}

export const hasTransportErrorCode = (error: unknown, list: string[]) =>
  TransportError.is(error) && list.includes((error as TransportError).code);
