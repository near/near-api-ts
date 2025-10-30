import { expect, describe, it } from 'vitest';
import {
  nearToken,
  near,
  yoctoNear,
  isNearToken,
} from '../../../src';

describe('NearToken', () => {
  it('1N + 2N = 3N', () => {
    const v = near('1').add(nearToken({ near: '2' })).near;
    expect(v).toBe('3');
  });

  it('1yN + 3yN = 4yN', () => {
    const v = yoctoNear(1n).add(nearToken({ yoctoNear: '3' })).yoctoNear;
    expect(v).toBe(4n);
  });

  it('5N > 2yN', () => {
    const v = nearToken({ near: '5' }).gt(yoctoNear(2n));
    expect(v).toBe(true);
  });

  it('Should be NearToken', () => {
    const v = isNearToken(nearToken({ near: '5' }));
    expect(v).toBe(true);
  });
});
