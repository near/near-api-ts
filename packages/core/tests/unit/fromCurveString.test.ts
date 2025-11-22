import { expect, describe, it } from 'vitest';
import {
  safeFromCurveString,
  fromCurveString,
} from '@common/transformers/curveString/fromCurveString';


describe('fromCurveString', () => {
  it('Error', () => {
    const r = safeFromCurveString('ed25519:#');

    console.log(r);

    // try {
    //   const v = fromCurveString('ed25519:#');
    // } catch (e) {
    //   console.log(e);
    //
    // }

    // const v = fromCurveString('ed25519:#');
    // console.log(v);
    // expect(v).toBe('3');
  });
});
