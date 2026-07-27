import type { FunctionCallError } from '@near-js/jsonrpc-types';
import type { ExecutionFailureError } from '../../../../../../../../../types/_common/transactionDetails/_common/_common/executionFailureError';
import { transformHostError } from './transformHostError';
import { transformWasmTrap } from './transformWasmTrap';

export const transformFunctionCallError = (
  rpcFunctionCallError: FunctionCallError,
):
  | ExecutionFailureError<'Action.FunctionCall.ContractWasm.NotFound'>
  | ExecutionFailureError<'Action.FunctionCall.Preparation.Failed'>
  | ExecutionFailureError<'Action.FunctionCall.Function.NotFound'>
  | ExecutionFailureError<'Action.FunctionCall.Execution.Failed'> => {
  if (typeof rpcFunctionCallError === 'string') {
    // Transform deprecated WasmUnknownError to be compatible with the modern nearcore ExecutionError
    if (rpcFunctionCallError === 'WasmUnknownError')
      return {
        kind: 'Action.FunctionCall.Execution.Failed',
        context: { cause: rpcFunctionCallError },
      };
    // Should never happen
    if (rpcFunctionCallError === '_EVMError')
      throw new Error('Unreachable', { cause: rpcFunctionCallError });
  }

  // Handle CompilationError errors
  if ('CompilationError' in rpcFunctionCallError) {
    const { CompilationError } = rpcFunctionCallError;

    if ('CodeDoesNotExist' in CompilationError)
      return {
        kind: 'Action.FunctionCall.ContractWasm.NotFound',
        context: { contractAccountId: CompilationError.CodeDoesNotExist.accountId },
      };

    if ('PrepareError' in CompilationError)
      return {
        kind: 'Action.FunctionCall.Preparation.Failed',
        context: { cause: CompilationError.PrepareError },
      };

    if ('WasmerCompileError' in CompilationError)
      return {
        kind: 'Action.FunctionCall.Preparation.Failed',
        context: { cause: CompilationError.WasmerCompileError.msg },
      };
  }

  // Handle MethodResolveError errors
  if ('MethodResolveError' in rpcFunctionCallError) {
    const { MethodResolveError } = rpcFunctionCallError;

    if (MethodResolveError === 'MethodEmptyName' || MethodResolveError === 'MethodNotFound')
      return {
        kind: 'Action.FunctionCall.Function.NotFound',
        context: null,
      };

    if (MethodResolveError === 'MethodInvalidSignature')
      return {
        kind: 'Action.FunctionCall.Preparation.Failed',
        context: { cause: 'InvalidFunctionSignature' },
      };
  }

  // Transform deprecated LinkError to be compatible with the modern nearcore ExecutionError
  if ('LinkError' in rpcFunctionCallError) {
    return {
      kind: 'Action.FunctionCall.Execution.Failed',
      context: { cause: `Link Error: ${rpcFunctionCallError.LinkError.msg}` },
    };
  }

  // Transform a deprecated HostError to be compatible with the modern nearcore ExecutionError
  if ('WasmTrap' in rpcFunctionCallError) {
    return {
      kind: 'Action.FunctionCall.Execution.Failed',
      context: { cause: transformWasmTrap(rpcFunctionCallError.WasmTrap) },
    };
  }

  // Transform a deprecated HostError to be compatible with the modern nearcore ExecutionError
  if ('HostError' in rpcFunctionCallError) {
    return {
      kind: 'Action.FunctionCall.Execution.Failed',
      context: { cause: transformHostError(rpcFunctionCallError.HostError) },
    };
  }

  // Handle Execution errors
  if ('ExecutionError' in rpcFunctionCallError)
    return {
      kind: 'Action.FunctionCall.Execution.Failed',
      context: { cause: rpcFunctionCallError.ExecutionError },
    };

  throw new Error('Unknown function call error', { cause: rpcFunctionCallError });
};
