import { describe, it } from 'vitest';
import { deployLocalContract, safeDeployLocalContract } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('deployLocalContract', () => {
  it('creates an action from wasmU8 or wasmBase64', () => {
    deployLocalContract({ wasmU8: Uint8Array.from([1, 2, 3]) });
    deployLocalContract({ wasmBase64: 'aGVsbG8=' });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeDeployLocalContract();
    assertNatErrKind(res, 'CreateAction.DeployLocalContract.Args.InvalidSchema');
  });

  it('rejects invalid wasmU8 with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeDeployLocalContract({ wasmU8: '###' });
    assertNatErrKind(res, 'CreateAction.DeployLocalContract.Args.InvalidSchema');
  });

  it('rejects invalid wasmBase64 with Args.InvalidSchema', () => {
    const res = safeDeployLocalContract({ wasmBase64: '###' });
    assertNatErrKind(res, 'CreateAction.DeployLocalContract.Args.InvalidSchema');
  });
});
