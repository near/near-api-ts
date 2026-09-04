import { describe, expect, it } from 'vitest';
import {
  registerPinnableGlobalContract,
  safeRegisterPinnableGlobalContract,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('registerPinnableGlobalContract', () => {
  it('creates a pinnable action from wasmU8', () => {
    const wasmU8 = Uint8Array.from([1, 2, 3]);

    expect(registerPinnableGlobalContract({ wasmU8 })).toEqual({
      actionType: 'RegisterPinnableGlobalContract',
      wasmU8,
    });
  });

  it('creates a pinnable action from wasmBase64', () => {
    expect(registerPinnableGlobalContract({ wasmBase64: 'AQID' })).toEqual({
      actionType: 'RegisterPinnableGlobalContract',
      wasmU8: Uint8Array.from([1, 2, 3]),
    });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeRegisterPinnableGlobalContract();
    assertNatErrKind(res, 'CreateAction.RegisterPinnableGlobalContract.Args.InvalidSchema');
  });

  it('rejects invalid wasmBase64 with Args.InvalidSchema', () => {
    const res = safeRegisterPinnableGlobalContract({ wasmBase64: '###' });
    assertNatErrKind(res, 'CreateAction.RegisterPinnableGlobalContract.Args.InvalidSchema');
  });
});
