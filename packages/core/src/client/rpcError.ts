import type { RpcError as JsonRpcError } from '@near-js/jsonrpc-types';
import { oneLine } from '@common/utils/common';
import type { InnerRpcEndpoint } from 'nat-types/client/transport';

type RpcRequest = {
  url: string;
  rpcType: InnerRpcEndpoint['type'];
  method: string;
  headers: Record<string, string>;
  body: unknown;
};

const Brand = Symbol.for('near-api-ts.RpcError');

const parseRequestValidationError = (name: string) => {
  if (name === 'PARSE_ERROR')
    return {
      code: 'ParseRequest',
      message: `Invalid request format. Please check it and try again.`,
    };

  if (name === 'METHOD_NOT_FOUND')
    return {
      code: 'MethodNotFound',
      message: `Unsupported method. Please check it and try again.`,
    };

  return {
    code: 'UnknownValidationError',
    message: 'Unknown request validation error.',
  };
};

// TODO use real type after OpenAPI schema will support HandlerError (in nearcore)
const parseHandlerError = (cause: unknown) => {
  const { name } = cause as { name: string };

  if (name === 'TIMEOUT_ERROR')
    return {
      code: 'RpcTransactionTimeout',
      message: oneLine(`RPC does not know the result of this transaction, 
        probably it is not executed yet. Please try again later.`),
    };

  if (name === 'UNKNOWN_BLOCK')
    return {
      code: 'UnknownBlock',
      message: oneLine(`Block either has never been observed on 
        the node or has been garbage collected. Please try again later or use 
        another RPC node.`),
    };

  if (name === 'GARBAGE_COLLECTED_BLOCK')
    return {
      code: 'GarbageCollectedBlock',
      message: oneLine(`Block is no longer available on this RPC node.
        Please use an archival node to fetch historical data.`),
    };

  if (name === 'NO_SYNCED_BLOCKS')
    return {
      code: 'NoSyncedBlocks',
      message: oneLine(`There are no fully synchronized blocks 
        on the node yet. Please try again later.`),
    };

  return {
    code: 'HandlerError',
    message: `Request execution error. Please check it and try again.`,
  };
};

const getErrorInfo = (__rawRpcError: JsonRpcError) => {
  const { name: type, cause } = __rawRpcError;

  if (type === 'REQUEST_VALIDATION_ERROR')
    return parseRequestValidationError(cause.name);

  if (type === 'HANDLER_ERROR') return parseHandlerError(cause);

  if (type === 'INTERNAL_ERROR')
    return {
      code: 'InternalServerError',
      message: `Internal server error. Please try again later or use another RPC node.`,
    };

  return {
    code: 'UnknownRequestError',
    message: 'Unknown request error.',
  };
};

export class RpcError extends Error {
  readonly [Brand] = true;
  public code: string;
  public request: RpcRequest;
  public __rawRpcError: JsonRpcError;

  constructor(args: {
    request: RpcRequest;
    __rawRpcError: JsonRpcError;
  }) {
    const { code, message } = getErrorInfo(args.__rawRpcError);

    super(
      `[${code}]: ${message} \n` +
        `Type: ${args.__rawRpcError.name} \n` +
        `Cause: ${JSON.stringify(args.__rawRpcError.cause, null, 2)}`,
    );
    this.name = 'RpcError';
    this.code = code;
    this.request = args.request;
    this.__rawRpcError = args.__rawRpcError;
  }

  static is(e: unknown) {
    return typeof e === 'object' && (e as any)[Brand] === true;
  }
}

export const hasRpcErrorCode = (error: unknown, list: string[]) =>
  RpcError.is(error) && list.includes((error as RpcError).code);
