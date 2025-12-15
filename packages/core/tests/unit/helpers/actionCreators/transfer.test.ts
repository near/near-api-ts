import { describe, it } from 'vitest';
import { near, safeTransfer, transfer, yoctoNear } from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('Create Transfer action', () => {
  it('Ok', () => {
    transfer({ amount: near('1') });
    transfer({ amount: { near: '1' } });

    transfer({ amount: yoctoNear(1n) });
    transfer({ amount: { yoctoNear: 1n } });

    transfer({ amount: yoctoNear('10') });
    transfer({ amount: { yoctoNear: '10' } });
  });

  it('InvalidSchema - no args', () => {
    // @ts-expect-error
    const res = safeTransfer();
    assertNatErrKind(res, 'CreateAction.Transfer.Args.InvalidSchema');
  });

  it('InvalidSchema - invalid amount', () => {
    // @ts-expect-error
    const res = safeTransfer({ amount: 1 });
    assertNatErrKind(res, 'CreateAction.Transfer.Args.InvalidSchema');
  });
});
