import { describe, expect, it } from 'vitest';
import {
  near,
  randomEd25519KeyPair,
  safeWithdrawAccessKeyBalance,
  withdrawAccessKeyBalance,
  yoctoNear,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('withdrawAccessKeyBalance', () => {
  const { publicKey } = randomEd25519KeyPair();

  it('creates an action from a public key and various amount formats', () => {
    expect(withdrawAccessKeyBalance({ publicKey, amount: near('1') })).toStrictEqual({
      actionType: 'WithdrawAccessKeyBalance',
      publicKey,
      amount: near('1'),
    });

    withdrawAccessKeyBalance({ publicKey, amount: { near: '1' } });
    withdrawAccessKeyBalance({ publicKey, amount: yoctoNear(1n) });
    withdrawAccessKeyBalance({ publicKey, amount: { yoctoNear: '10' } });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeWithdrawAccessKeyBalance();
    assertNatErrKind(res, 'CreateAction.WithdrawAccessKeyBalance.Args.InvalidSchema');
  });

  it('rejects a missing amount with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeWithdrawAccessKeyBalance({ publicKey });
    assertNatErrKind(res, 'CreateAction.WithdrawAccessKeyBalance.Args.InvalidSchema');
  });

  it('rejects an invalid amount with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeWithdrawAccessKeyBalance({ publicKey, amount: 1 });
    assertNatErrKind(res, 'CreateAction.WithdrawAccessKeyBalance.Args.InvalidSchema');
  });

  it('rejects an invalid public key with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeWithdrawAccessKeyBalance({ publicKey: '###', amount: near('1') });
    assertNatErrKind(res, 'CreateAction.WithdrawAccessKeyBalance.Args.InvalidSchema');
  });
});
