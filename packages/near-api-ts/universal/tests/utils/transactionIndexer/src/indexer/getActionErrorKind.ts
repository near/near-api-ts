import { type ActionError } from '@near-js/jsonrpc-types';

const convertActionError = (actionError: ActionError) => {
  const { kind } = actionError;
  let errorKind = 'ActionError.';

  if (typeof kind === 'string') return errorKind + kind;

  if ('FunctionCallError' in kind) {
    const { FunctionCallError } = kind;
    errorKind = errorKind + 'FunctionCallError.';

    if (typeof FunctionCallError === 'string') return errorKind + FunctionCallError;

    if ('ExecutionError' in FunctionCallError) return errorKind + 'ExecutionError';

    if ('MethodResolveError' in FunctionCallError)
      return errorKind + 'MethodResolveError.' + FunctionCallError.MethodResolveError;

    if ('CompilationError' in FunctionCallError) {
      const { CompilationError } = FunctionCallError;
      errorKind = errorKind + 'CompilationError.';

      if ('WasmerCompileError' in CompilationError) return errorKind + 'WasmerCompileError';
      if ('CodeDoesNotExist' in CompilationError) return errorKind + 'CodeDoesNotExist';

      if ('PrepareError' in CompilationError)
        return errorKind + 'PrepareError.' + CompilationError.PrepareError;
    }

    if ('LinkError' in FunctionCallError) return errorKind + 'LinkError';

    if ('HostError' in FunctionCallError) {
      const { HostError } = FunctionCallError;
      if (typeof HostError === 'string') return errorKind + 'HostError.' + HostError;
      return errorKind + 'HostError.' + Object.keys(HostError)[0];
    }

    if ('WasmTrap' in FunctionCallError)
      return errorKind + 'WasmTrap.' + FunctionCallError.WasmTrap;
  }

  if ('NewReceiptValidationError' in kind) {
    const { NewReceiptValidationError } = kind;
    errorKind = errorKind + 'NewReceiptValidationError.';

    if ('ActionsValidation' in NewReceiptValidationError) {
      const { ActionsValidation } = NewReceiptValidationError;
      errorKind = errorKind + 'ActionsValidation.';
      if (typeof ActionsValidation === 'string') return errorKind + ActionsValidation;
      return errorKind + Object.keys(ActionsValidation)[0];
    }

    return errorKind + Object.keys(NewReceiptValidationError)[0];
  }

  if ('DelegateActionAccessKeyError' in kind) {
    const { DelegateActionAccessKeyError } = kind;
    errorKind = errorKind + 'DelegateActionAccessKeyError.';

    if (typeof DelegateActionAccessKeyError === 'string')
      return errorKind + DelegateActionAccessKeyError;

    return errorKind + Object.keys(DelegateActionAccessKeyError)[0];
  }

  return errorKind + Object.keys(kind)[0];
};

export const getActionErrorKind = (actionError: ActionError) => {
  try {
    return convertActionError(actionError);
  } catch (e) {
    return `UnknownActionError: ${JSON.stringify(actionError)}`;
  }
};
