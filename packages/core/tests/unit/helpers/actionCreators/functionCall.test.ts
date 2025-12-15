import { describe, expect, it } from 'vitest';
import { functionCall, safeFunctionCall, teraGas } from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('Create FunctionCall action - ok', () => {
  it('Ok', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
    });
    expect(res.functionName).toBe('create');
  });

  it('Ok - attachedDeposit', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
      attachedDeposit: { yoctoNear: 1n },
    });
    expect(res.functionName).toBe('create');
  });

  it('Ok - json functionArgs', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1 },
    });
    expect(res.functionName).toBe('create');
  });

  it('Ok - json functionArgs', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
      functionArgs: 1,
    });
    expect(res.functionName).toBe('create');
  });

  it('Ok - functionArgs + serializeArgs', () => {
    const res = functionCall({
      functionName: 'create',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1n },
      options: {
        serializeArgs: (args) =>
          Uint8Array.from([args.functionArgs.a.toString()]),
      },
    });
    expect(res.functionName).toBe('create');
  });

  it('Ok - serializeArgs only', () => {
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

describe('Create FunctionCall action - errors', () => {
  it('Args.InvalidSchema - Invalid gasLimit', () => {
    const res = safeFunctionCall({
      functionName: 'create',
      gasLimit: { teraGas: '-10' },
    });
    assertNatErrKind(res, 'CreateAction.FunctionCall.Args.InvalidSchema');
  });

  it('Args.InvalidSchema - invalid json', () => {
    // @ts-expect-error
    const res = safeFunctionCall({
      functionName: 'x',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1n },
    });
    assertNatErrKind(res, 'CreateAction.FunctionCall.Args.InvalidSchema');
  });

  it('CustomSerializer.InvalidOutput', () => {
    const res = safeFunctionCall({
      functionName: 'x',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1n },
      options: {
        // @ts-expect-error
        serializeArgs: () => 1,
      },
    });
    assertNatErrKind(
      res,
      'CreateAction.FunctionCall.CustomSerializer.InvalidOutput',
    );
  });

  it('CustomSerializer.Internal', () => {
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
    assertNatErrKind(
      res,
      'CreateAction.FunctionCall.CustomSerializer.Internal',
    );
  });
});
