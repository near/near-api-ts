import type { HostError } from '@near-js/jsonrpc-types';

/**
 * Reproduces nearcore's `impl std::fmt::Display for HostError`, converting an
 * old `HostError` into the exact human-readable string nearcore emits nowadays. Used as the
 * `cause` of an `Action.FunctionCall.Execution.Failed` ExecutionError.
 */
export const transformHostError = (hostError: HostError): string => {
  if (typeof hostError === 'string') {
    if (hostError === 'BadUTF8') return 'String encoding is bad UTF-8 sequence.';
    if (hostError === 'BadUTF16') return 'String encoding is bad UTF-16 sequence.';
    if (hostError === 'GasExceeded') return 'Exceeded the prepaid gas.';
    if (hostError === 'GasLimitExceeded')
      return 'Exceeded the maximum amount of gas allowed to burn per contract.';
    if (hostError === 'BalanceExceeded') return 'Exceeded the account balance.';
    if (hostError === 'EmptyMethodName') return 'Tried to call an empty method name.';
    if (hostError === 'IntegerOverflow') return 'Integer overflow.';
    if (hostError === 'CannotAppendActionToJointPromise')
      return 'Actions can only be appended to non-joint promise.';
    if (hostError === 'CannotReturnJointPromise')
      return 'Returning joint promise is currently prohibited.';
    if (hostError === 'MemoryAccessViolation') return 'Accessed memory outside the bounds.';
    if (hostError === 'InvalidAccountId') return 'VM Logic returned an invalid account id';
    if (hostError === 'InvalidMethodName') return 'VM Logic returned an invalid method name';
    if (hostError === 'InvalidPublicKey') return 'VM Logic provided an invalid public key';
  }

  if ('GuestPanic' in hostError) return `Smart contract panicked: ${hostError.GuestPanic.panicMsg}`;

  if ('InvalidPromiseIndex' in hostError)
    return `${hostError.InvalidPromiseIndex.promiseIdx} does not correspond to existing promises`;

  if ('InvalidPromiseResultIndex' in hostError)
    return `Accessed invalid promise result index: ${hostError.InvalidPromiseResultIndex.resultIdx}`;

  if ('InvalidRegisterId' in hostError)
    return `Accessed invalid register id: ${hostError.InvalidRegisterId.registerId}`;

  // Removed from nearcore's current Display impl; historical message retained.
  if ('IteratorWasInvalidated' in hostError)
    return (
      `Iterator ${hostError.IteratorWasInvalidated.iteratorIndex} was invalidated ` +
      `after its creation by performing a mutable operation on trie`
    );

  if ('InvalidReceiptIndex' in hostError)
    return (
      `VM Logic returned an invalid receipt index: ` +
      `${hostError.InvalidReceiptIndex.receiptIndex}`
    );

  if ('InvalidIteratorIndex' in hostError)
    return `Iterator index ${hostError.InvalidIteratorIndex.iteratorIndex} does not exist`;

  if ('ProhibitedInView' in hostError)
    return `${hostError.ProhibitedInView.methodName} is not allowed in view calls`;

  if ('NumberOfLogsExceeded' in hostError)
    return `The number of logs will exceed the limit ${hostError.NumberOfLogsExceeded.limit}`;

  if ('KeyLengthExceeded' in hostError)
    return (
      `The length of a storage key ${hostError.KeyLengthExceeded.length} ` +
      `exceeds the limit ${hostError.KeyLengthExceeded.limit}`
    );

  if ('ValueLengthExceeded' in hostError)
    return (
      `The length of a storage value ${hostError.ValueLengthExceeded.length} ` +
      `exceeds the limit ${hostError.ValueLengthExceeded.limit}`
    );

  if ('TotalLogLengthExceeded' in hostError)
    return (
      `The length of a log message ${hostError.TotalLogLengthExceeded.length} ` +
      `exceeds the limit ${hostError.TotalLogLengthExceeded.limit}`
    );

  if ('NumberPromisesExceeded' in hostError)
    return (
      'The number of promises within a FunctionCall ' +
      `${hostError.NumberPromisesExceeded.numberOfPromises} ` +
      `exceeds the limit ${hostError.NumberPromisesExceeded.limit}`
    );

  if ('NumberInputDataDependenciesExceeded' in hostError)
    return (
      'The number of input data dependencies ' +
      `${hostError.NumberInputDataDependenciesExceeded.numberOfInputDataDependencies} ` +
      `exceeds the limit ${hostError.NumberInputDataDependenciesExceeded.limit}`
    );

  if ('ReturnedValueLengthExceeded' in hostError)
    return (
      `The length of a returned value ${hostError.ReturnedValueLengthExceeded.length} ` +
      `exceeds the limit ${hostError.ReturnedValueLengthExceeded.limit}`
    );

  if ('ContractSizeExceeded' in hostError)
    return (
      'The size of a contract code in DeployContract action ' +
      `${hostError.ContractSizeExceeded.size}` +
      `exceeds the limit ${hostError.ContractSizeExceeded.limit}`
    );

  if ('Deprecated' in hostError)
    return `Attempted to call deprecated host function ${hostError.Deprecated.methodName}`;

  if ('AltBn128InvalidInput' in hostError)
    return `AltBn128 invalid input: ${hostError.AltBn128InvalidInput.msg}`;

  if ('ECRecoverError' in hostError) return `ECDSA recover error: ${hostError.ECRecoverError.msg}`;

  if ('Ed25519VerifyInvalidInput' in hostError)
    return `ED25519 signature verification error: ${hostError.Ed25519VerifyInvalidInput.msg}`;

  // Should never happen as all new host errors are transformed into string (ExecutionError)
  // by nearcore itself
  return JSON.stringify(hostError);
};
