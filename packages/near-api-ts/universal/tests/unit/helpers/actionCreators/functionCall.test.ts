import { describe, expect, it } from 'vitest';
import { functionCall, safeFunctionCall, teraGas } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('functionCall › valid', () => {
  it('creates an action with only name and gasLimit', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
    });
    expect(res.functionName).toBe('create');
  });

  it('creates an action with an attachedDeposit', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
      attachedDeposit: { yoctoNear: 1n },
    });
    expect(res.functionName).toBe('create');
  });

  it('creates an action with object functionArgs', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1 },
    });
    expect(res.functionName).toBe('create');
  });

  it('creates an action with primitive functionArgs', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
      functionArgs: 1,
    });
    expect(res.functionName).toBe('create');
  });

  it('creates an action with functionArgs and a custom serializeArgs', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1n },
      options: {
        serializeArgs: (args) => Uint8Array.from([args.functionArgs.a.toString()]),
      },
    });
    expect(res.functionName).toBe('create');
  });

  it('creates an action with serializeArgs and no functionArgs', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
      options: {
        serializeArgs: (_args) => new Uint8Array(1),
      },
    });
    expect(res.functionName).toBe('create');
  });
});

describe('functionCall › invalid', () => {
  it('rejects a negative gasLimit with Args.InvalidSchema', () => {
    const res = safeFunctionCall({
      functionName: 'create',
      gasLimit: { teraGas: '-10' },
    });
    assertNatErrKind(res, 'CreateAction.FunctionCall.Args.InvalidSchema');
  });

  it('rejects non-JSON-serializable functionArgs with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeFunctionCall({
      functionName: 'x',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1n },
    });
    assertNatErrKind(res, 'CreateAction.FunctionCall.Args.InvalidSchema');
  });

  it('fails with SerializeArgs.InvalidOutput when serializeArgs returns a non-Uint8Array', () => {
    const res = safeFunctionCall({
      functionName: 'x',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1n },
      options: {
        // @ts-expect-error
        serializeArgs: () => 1,
      },
    });
    assertNatErrKind(res, 'CreateAction.FunctionCall.SerializeArgs.InvalidOutput');
  });

  it('fails with SerializeArgs.Failed when serializeArgs throws', () => {
    const res = safeFunctionCall({
      functionName: 'x',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1 },
      options: {
        serializeArgs: () => {
          throw new Error('Internal');
        },
      },
    });
    assertNatErrKind(res, 'CreateAction.FunctionCall.SerializeArgs.Failed');
  });
});
