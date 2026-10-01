import { describe, expect, it } from 'vitest';
import {
  near,
  randomEd25519KeyPair,
  safeTopUpAccessKeyBalance,
  topUpAccessKeyBalance,
  yoctoNear,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('topUpAccessKeyBalance', () => {
  const { publicKey } = randomEd25519KeyPair();

  it('creates an action from a public key and various amount formats', () => {
    expect(topUpAccessKeyBalance({ publicKey, amount: near('1') })).toStrictEqual({
      actionType: 'TopUpAccessKeyBalance',
      publicKey,
      amount: near('1'),
    });

    topUpAccessKeyBalance({ publicKey, amount: { near: '1' } });
    topUpAccessKeyBalance({ publicKey, amount: yoctoNear(1n) });
    topUpAccessKeyBalance({ publicKey, amount: { yoctoNear: '10' } });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeTopUpAccessKeyBalance();
    assertNatErrKind(res, 'CreateAction.TopUpAccessKeyBalance.Args.InvalidSchema');
  });

  it('rejects a missing amount with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeTopUpAccessKeyBalance({ publicKey });
    assertNatErrKind(res, 'CreateAction.TopUpAccessKeyBalance.Args.InvalidSchema');
  });

  it('rejects an invalid amount with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeTopUpAccessKeyBalance({ publicKey, amount: 1 });
    assertNatErrKind(res, 'CreateAction.TopUpAccessKeyBalance.Args.InvalidSchema');
  });

  it('rejects an invalid public key with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeTopUpAccessKeyBalance({ publicKey: '###', amount: near('1') });
    assertNatErrKind(res, 'CreateAction.TopUpAccessKeyBalance.Args.InvalidSchema');
  });
});
