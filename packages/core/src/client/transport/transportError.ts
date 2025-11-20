import { RpcError } from '../rpcError';
import type { RpcRequestLog } from 'nat-types/client/transport';

export class DeprecatedNatError extends Error {
  public code: string;
  public name: string;
  public errors?: (RpcError | TransportError)[];
  public timestamp: number;
  public request?: RpcRequestLog;

  constructor(
    args: {
      code: string;
      message: string;
      request?: RpcRequestLog;
      cause?: unknown;
    },
    name = 'NatError',
  ) {
    super(`[${args.code}] ${args.message}`, { cause: args.cause });
    this.name = name;
    this.code = args.code;
    this.timestamp = Date.now();
    this.request = args.request;
  }

  static is(e: unknown) {
    return (
      typeof e === 'object' &&
      (e as any)[Symbol.for(`near-api-ts.${this.name}`)] === true
    );
  }
}

const TransportErrorBrand = Symbol.for('near-api-ts.TransportError');

export class TransportError extends DeprecatedNatError {
  readonly [TransportErrorBrand] = true;

  constructor(args: {
    code: string;
    message: string;
    cause?: unknown;
    request?: RpcRequestLog;
  }) {
    super(args, 'TransportError');
  }
}

export const hasTransportErrorCode = (error: unknown, list: string[]) =>
  TransportError.is(error) && list.includes((error as TransportError).code);
