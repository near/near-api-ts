import { expect, describe, it } from 'vitest';
import { gas, nearGas, teraGas, isNearGas } from '../../../src';

const TeraCoefficient = 1_000_000_000_000n;

describe('NearGas', () => {
  it('1tg + 2tg = 3tg', () => {
    const v = teraGas('1').add({ teraGas: '2' });
    expect(v.teraGas).toBe('3');
    expect(v.gas).toBe(3n * TeraCoefficient);
  });

  it('1tg - 2tg = -1tg', () => {
    const v = teraGas('1').sub({ teraGas: '2' });
    expect(v.teraGas).toBe('-1');
    expect(v.gas).toBe(-1n * TeraCoefficient);
  });

  it('1g + 3g = 4g', () => {
    const v = gas(1n).add(nearGas({ gas: 3n }));
    console.log(v);
    expect(v.gas).toBe(4n);
  });

  it('1g - 3g = -2g', () => {
    const v = gas(1n).sub(nearGas({ gas: 3n }));
    console.log(v);
    expect(v.gas).toBe(-2n);
  });

  it('5tg > 2tg', () => {
    const v = nearGas({ teraGas: '5' }).gt({ teraGas: '2' });
    expect(v).toBe(true);
  });

  it('Should be NearGas', () => {
    const v = isNearGas(nearGas({ gas: 10 }));
    expect(v).toBe(true);
  });
});
