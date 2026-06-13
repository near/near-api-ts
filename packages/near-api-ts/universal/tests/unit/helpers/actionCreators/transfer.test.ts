import { describe, it } from 'vitest';
import { near, safeTransfer, transfer, yoctoNear } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('transfer', () => {
  it('creates an action from various amount formats', () => {
    transfer({ amount: near('1') });
    transfer({ amount: { near: '1' } });

    transfer({ amount: yoctoNear(1n) });
    transfer({ amount: { yoctoNear: 1n } });

    transfer({ amount: yoctoNear('10') });
    transfer({ amount: { yoctoNear: '10' } });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeTransfer();
    assertNatErrKind(res, 'CreateAction.Transfer.Args.InvalidSchema');
  });

  it('rejects an invalid amount with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeTransfer({ amount: 1 });
    assertNatErrKind(res, 'CreateAction.Transfer.Args.InvalidSchema');
  });
});
