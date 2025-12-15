import { describe, it } from 'vitest';
import { deleteAccount, safeDeleteAccount } from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('Delete Account action', () => {
  it('Ok', () => {
    deleteAccount({ beneficiaryAccountId: 'nat' });
  });

  it('InvalidSchema - no args', () => {
    // @ts-expect-error
    const res = safeDeleteAccount();
    assertNatErrKind(res, 'CreateAction.DeleteAccount.Args.InvalidSchema');
  });

  it('InvalidSchema - invalid amount', () => {
    const res = safeDeleteAccount({ beneficiaryAccountId: '###' });
    assertNatErrKind(res, 'CreateAction.DeleteAccount.Args.InvalidSchema');
  });
});
