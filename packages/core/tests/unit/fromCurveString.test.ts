import {describe, it} from 'vitest';
import {fromCurveString} from '@common/transformers/curveString';

describe('fromCurveString', () => {
  it('Error', () => {
    const r = fromCurveString('ed25519:#');

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
