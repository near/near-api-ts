import { describe, it } from 'vitest';
import { deleteAccount, safeDeleteAccount } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('deleteAccount', () => {
  it('creates an action from a valid beneficiary', () => {
    deleteAccount({ beneficiaryAccountId: 'nat' });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeDeleteAccount();
    assertNatErrKind(res, 'CreateAction.DeleteAccount.Args.InvalidSchema');
  });

  it('rejects an invalid beneficiary account id with Args.InvalidSchema', () => {
    const res = safeDeleteAccount({ beneficiaryAccountId: '###' });
    assertNatErrKind(res, 'CreateAction.DeleteAccount.Args.InvalidSchema');
  });
});
