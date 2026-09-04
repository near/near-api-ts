import { describe, expect, it } from 'vitest';
import {
  registerLinkableGlobalContract,
  safeRegisterLinkableGlobalContract,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('registerLinkableGlobalContract', () => {
  it('creates a linkable action from wasmU8', () => {
    const wasmU8 = Uint8Array.from([1, 2, 3]);

    expect(registerLinkableGlobalContract({ wasmU8 })).toEqual({
      actionType: 'RegisterLinkableGlobalContract',
      wasmU8,
    });
  });

  it('creates a linkable action from wasmBase64', () => {
    expect(registerLinkableGlobalContract({ wasmBase64: 'AQID' })).toEqual({
      actionType: 'RegisterLinkableGlobalContract',
      wasmU8: Uint8Array.from([1, 2, 3]),
    });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeRegisterLinkableGlobalContract();
    assertNatErrKind(res, 'CreateAction.RegisterLinkableGlobalContract.Args.InvalidSchema');
  });

  it('rejects invalid wasmBase64 with Args.InvalidSchema', () => {
    const res = safeRegisterLinkableGlobalContract({ wasmBase64: '###' });
    assertNatErrKind(res, 'CreateAction.RegisterLinkableGlobalContract.Args.InvalidSchema');
  });
});
