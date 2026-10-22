import { describe, expect, it } from 'vitest';
import { callContractFunction, safeCallContractFunction, teraGas } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('callContractFunction › valid', () => {
  it('creates an action with only name and gasLimit', () => {
    const res = callContractFunction({
      functionName: 'create',
      gasLimit: teraGas('10'),
    });
    expect(res.functionName).toBe('create');
  });

  it('creates an action with an attachedDeposit', () => {
    const res = callContractFunction({
      functionName: 'create',
      gasLimit: teraGas('10'),
      attachedDeposit: { yoctoNear: 1n },
    });
    expect(res.functionName).toBe('create');
  });

  it('creates an action with object functionArgs', () => {
    const res = callContractFunction({
      functionName: 'create',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1 },
    });
    expect(res.functionName).toBe('create');
  });

  it('creates an action with primitive functionArgs', () => {
    const res = callContractFunction({
      functionName: 'create',
      gasLimit: teraGas('10'),
      functionArgs: 1,
    });
    expect(res.functionName).toBe('create');
  });

  it('creates an action with functionArgs and a custom serializeArgs', () => {
    const res = callContractFunction({
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
    const res = callContractFunction({
      functionName: 'create',
      gasLimit: teraGas('10'),
      options: {
        serializeArgs: (_args) => new Uint8Array(1),
      },
    });
    expect(res.functionName).toBe('create');
  });
});

describe('callContractFunction › invalid', () => {
  it('rejects a negative gasLimit with Args.InvalidSchema', () => {
    const res = safeCallContractFunction({
      functionName: 'create',
      gasLimit: { teraGas: '-10' },
    });
    assertNatErrKind(res, 'CreateAction.CallContractFunction.Args.InvalidSchema');
  });

  it('rejects non-JSON-serializable functionArgs with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeCallContractFunction({
      functionName: 'x',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1n },
    });
    assertNatErrKind(res, 'CreateAction.CallContractFunction.Args.InvalidSchema');
  });

  it('fails with SerializeArgs.InvalidOutput when serializeArgs returns a non-Uint8Array', () => {
    const res = safeCallContractFunction({
      functionName: 'x',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1n },
      options: {
        // @ts-expect-error
        serializeArgs: () => 1,
      },
    });
    assertNatErrKind(res, 'CreateAction.CallContractFunction.SerializeArgs.InvalidOutput');
  });

  it('fails with SerializeArgs.Failed when serializeArgs throws', () => {
    const res = safeCallContractFunction({
      functionName: 'x',
      gasLimit: teraGas('10'),
      functionArgs: { a: 1 },
      options: {
        serializeArgs: () => {
          throw new Error('Internal');
        },
      },
    });
    assertNatErrKind(res, 'CreateAction.CallContractFunction.SerializeArgs.Failed');
  });
});
