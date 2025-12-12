import { expect, describe, it } from 'vitest';
import {
  nearToken,
  near,
  safeNear,
  yoctoNear,
  isNearToken,
} from '../../../src';
import { assertNatErrKind } from '../../utils/assertNatErrKind';

describe('NearToken', () => {
  it('1N + 2N = 3N', () => {
    const v = near('1').add(nearToken({ near: '2' })).near;
    expect(v).toBe('3');
  });

  it('1yN + 3yN = 4yN', () => {
    const v = yoctoNear(1n).add(nearToken({ yoctoNear: '3' })).yoctoNear;
    expect(v).toBe(4n);
  });

  it('10N - 3N = 7N', () => {
    const v = nearToken({ near: '10' }).sub(near('3')).near;
    expect(v).toBe('7');
  });

  it('3N - 10N = -7N', () => {
    const v = nearToken({ near: '3' }).sub(near('10'));
    expect(v.near).toBe('-7');
  });

  it('5N > 2yN = true', () => {
    const v = nearToken({ near: '5' }).gt(yoctoNear(2n));
    expect(v).toBe(true);
  });

  it('5N < 1N = false', () => {
    const v = near('5').lt({ near: '1' });
    expect(v).toBe(false);
  });

  it('5yN < 1N', () => {
    const v = yoctoNear('5').lt({ near: '1' });
    expect(v).toBe(true);
  });

  it('Should be NearToken', () => {
    const v = isNearToken(nearToken({ near: '5' }));
    expect(v).toBe(true);
  });
});

describe('CreateNearTokenFromNear error', () => {
  it('Plain string', () => {
    const x = safeNear('1a');
    assertNatErrKind(x, 'CreateNearTokenFromNear.Args.InvalidSchema');
  });

  it('Not a string number', () => {
    //@ts-expect-error
    const x2 = safeNear(1);
    assertNatErrKind(x2, 'CreateNearTokenFromNear.Args.InvalidSchema');
  });
});
