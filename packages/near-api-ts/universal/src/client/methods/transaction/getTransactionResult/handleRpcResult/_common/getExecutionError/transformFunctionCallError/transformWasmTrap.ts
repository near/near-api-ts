import type { WasmTrap } from '@near-js/jsonrpc-types';

/**
 * Reproduces nearcore's `impl std::fmt::Display for WasmTrap`, converting an
 * old `WasmTrap` into the exact human-readable string nearcore emits nowadays. Used as the
 * `cause` of an `Action.FunctionCall.Execution.Failed` ExecutionError.
 */
export const transformWasmTrap = (wasmTrap: WasmTrap): string => {
  if (wasmTrap === 'Unreachable') return 'An `unreachable` opcode was executed.';
  if (wasmTrap === 'MemoryOutOfBounds') return 'Memory out of bounds trap.';
  if (wasmTrap === 'CallIndirectOOB') return 'Call indirect out of bounds trap.';
  if (wasmTrap === 'IllegalArithmetic') return 'An arithmetic exception, e.g. divided by zero.';
  if (wasmTrap === 'MisalignedAtomicAccess') return 'Misaligned atomic access trap.';
  if (wasmTrap === 'GenericTrap') return 'Generic trap.';
  if (wasmTrap === 'StackOverflow') return 'Stack overflow.';
  if (wasmTrap === 'IndirectCallToNull') return 'Indirect call to null.';
  if (wasmTrap === 'IncorrectCallIndirectSignature')
    return 'Call indirect incorrect signature trap.';

  return JSON.stringify(wasmTrap); // Should never happen
};
