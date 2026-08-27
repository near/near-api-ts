import { describe, it } from 'vitest';
import { deployContract, safeDeployContract } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('deployContract', () => {
  it('creates an action from wasmU8 or wasmBase64', () => {
    deployContract({ wasmU8: Uint8Array.from([1, 2, 3]) });
    deployContract({ wasmBase64: 'aGVsbG8=' });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeDeployContract();
    assertNatErrKind(res, 'CreateAction.DeployContract.Args.InvalidSchema');
  });

  it('rejects invalid wasmU8 with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeDeployContract({ wasmU8: '###' });
    assertNatErrKind(res, 'CreateAction.DeployContract.Args.InvalidSchema');
  });

  it('rejects invalid wasmBase64 with Args.InvalidSchema', () => {
    const res = safeDeployContract({ wasmBase64: '###' });
    assertNatErrKind(res, 'CreateAction.DeployContract.Args.InvalidSchema');
  });
});
