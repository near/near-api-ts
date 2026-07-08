import type { FunctionCallError } from '@near-js/jsonrpc-types';
import type { ExecutionError } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionError';
import { transformHostError } from './transformHostError';
import { transformWasmTrap } from './transformWasmTrap';

export const transformFunctionCallError = (
  rpcFunctionCallError: FunctionCallError,
):
  | ExecutionError<'Action.FunctionCall.Wasm.NotFound'>
  | ExecutionError<'Action.FunctionCall.Compilation.Failed'>
  | ExecutionError<'Action.FunctionCall.Function.NotFound'>
  | ExecutionError<'Action.FunctionCall.Execution.Failed'> => {
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
        kind: 'Action.FunctionCall.Wasm.NotFound',
        context: { contractAccountId: CompilationError.CodeDoesNotExist.accountId },
      };

    if ('PrepareError' in CompilationError)
      return {
        kind: 'Action.FunctionCall.Compilation.Failed',
        context: { cause: CompilationError.PrepareError },
      };

    if ('WasmerCompileError' in CompilationError)
      return {
        kind: 'Action.FunctionCall.Compilation.Failed',
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
        kind: 'Action.FunctionCall.Compilation.Failed',
        context: { cause: 'InvalidFunctionSignature' }
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
