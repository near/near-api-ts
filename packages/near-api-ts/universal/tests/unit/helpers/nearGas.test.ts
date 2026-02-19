import { describe, expect, it } from 'vitest';
import { gas, isNearGas, nearGas, safeNearGas, safeTeraGas, teraGas } from '../../../index';
import { assertNatErrKind } from '../../utils/assertNatErrKind';

const TeraCoefficient = 1_000_000_000_000n;

describe('Create FromTeraGas - Ok', () => {
  it('Create 1tG', () => {
    const x1 = teraGas('1');
    expect(x1.teraGas).toBe('1');
    expect(x1.gas).toBe(1n * TeraCoefficient);
  });

  it('Create 300tG', () => {
    const x1 = teraGas('300');
    expect(x1.teraGas).toBe('300');
    expect(x1.gas).toBe(300n * TeraCoefficient);
  });

  it('Create 30.25tG', () => {
    const x1 = teraGas('30.25');
    expect(x1.teraGas).toBe('30.25');
    expect(x1.gas).toBe(30250000000000n);
  });

  it('Create 0.001tG', () => {
    const x1 = teraGas('0.001');
    expect(x1.teraGas).toBe('0.001');
    expect(x1.gas).toBe(1000000000n);
  });

  it('Create 0tG', () => {
    const x1 = teraGas('0');
    expect(x1.teraGas).toBe('0');
    expect(x1.gas).toBe(0n);
  });
});

describe('Create FromTeraGas - Err', () => {
  it(`'1a'`, () => {
    const x1 = safeTeraGas('1a');
    assertNatErrKind(x1, 'CreateNearGasFromTeraGas.Args.InvalidSchema');
  });

  it(`'0.0000000000001'`, () => {
    const x1 = safeTeraGas('0.0000000000001');
    assertNatErrKind(x1, 'CreateNearGasFromTeraGas.Args.InvalidSchema');
  });

  it(`1`, () => {
    //@ts-expect-error
    const x1 = safeTeraGas(1);
    assertNatErrKind(x1, 'CreateNearGasFromTeraGas.Args.InvalidSchema');
  });
});

describe('Create FromGas - Ok', () => {
  it('Create 1g', () => {
    const x1 = gas(1);
    expect(x1.teraGas).toBe('0.000000000001');
    expect(x1.gas).toBe(1n);
  });

  it('Create 30250000000000g', () => {
    const x1 = gas(30250000000000);
    expect(x1.teraGas).toBe('30.25');
    expect(x1.gas).toBe(30250000000000n);
  });

  it('Create 0g', () => {
    const x1 = gas(0);
    expect(x1.teraGas).toBe('0');
    expect(x1.gas).toBe(0n);
  });
});

describe('Create NearGas - Err', () => {
  it('Create { a: 1 } ', () => {
    //@ts-expect-error
    const x1 = safeNearGas({ a: 1 });
    assertNatErrKind(x1, 'CreateNearGas.Args.InvalidSchema');
  });
  it(`Create { gas: '0.1' } `, () => {
    //@ts-expect-error
    const x1 = safeNearGas({ gas: '0.1' });
    assertNatErrKind(x1, 'CreateNearGas.Args.InvalidSchema');
  });
  it(`Create { gas: 0.1 } `, () => {
    const x1 = safeNearGas({ gas: 0.1 });
    assertNatErrKind(x1, 'CreateNearGas.Args.InvalidSchema');
  });
});

describe('NearGas Math', () => {
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

  it('5tg > 2tg = true', () => {
    const v = nearGas({ teraGas: '5' }).gt({ teraGas: '2' });
    expect(v).toBe(true);
  });

  it('5tg > 2g = true', () => {
    const v = nearGas({ teraGas: '5' }).gt({ gas: 2 });
    expect(v).toBe(true);
  });

  it('5tg < 2tg = false', () => {
    const v = nearGas({ teraGas: '5' }).lt({ teraGas: '2' });
    expect(v).toBe(false);
  });

  it('5g < 10g = true', () => {
    const v = gas(5).lt(gas(10));
    expect(v).toBe(true);
  });

  it('Should be NearGas', () => {
    const v = isNearGas(nearGas({ gas: 10 }));
    expect(v).toBe(true);
  });
});
