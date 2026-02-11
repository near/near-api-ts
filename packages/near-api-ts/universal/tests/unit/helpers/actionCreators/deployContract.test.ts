import { describe, it } from 'vitest';
import { deployContract, safeDeployContract } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('Deploy Contract action', () => {
  it('Ok', () => {
    deployContract({ wasmBytes: Uint8Array.from([1, 2, 3]) });
    deployContract({ wasmBase64: 'aGVsbG8=' });
  });

  it('InvalidSchema - no args', () => {
    // @ts-expect-error
    const res = safeDeployContract();
    assertNatErrKind(res, 'CreateAction.DeployContract.Args.InvalidSchema');
  });

  it('InvalidSchema - invalid wasmBytes', () => {
    // @ts-expect-error
    const res = safeDeployContract({ wasmBytes: '###' });
    assertNatErrKind(res, 'CreateAction.DeployContract.Args.InvalidSchema');
  });

  it('InvalidSchema - invalid wasmBase64', () => {
    const res = safeDeployContract({ wasmBase64: '###' });
    assertNatErrKind(res, 'CreateAction.DeployContract.Args.InvalidSchema');
  });
});
