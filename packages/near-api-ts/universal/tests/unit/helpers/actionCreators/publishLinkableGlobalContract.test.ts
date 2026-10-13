import { describe, expect, it } from 'vitest';
import {
  publishLinkableGlobalContract,
  safePublishLinkableGlobalContract,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('publishLinkableGlobalContract', () => {
  it('creates a linkable action from wasmU8', () => {
    const wasmU8 = Uint8Array.from([1, 2, 3]);

    expect(publishLinkableGlobalContract({ wasmU8 })).toEqual({
      actionType: 'PublishLinkableGlobalContract',
      wasmU8,
    });
  });

  it('creates a linkable action from wasmBase64', () => {
    expect(publishLinkableGlobalContract({ wasmBase64: 'AQID' })).toEqual({
      actionType: 'PublishLinkableGlobalContract',
      wasmU8: Uint8Array.from([1, 2, 3]),
    });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safePublishLinkableGlobalContract();
    assertNatErrKind(res, 'CreateAction.PublishLinkableGlobalContract.Args.InvalidSchema');
  });

  it('rejects invalid wasmBase64 with Args.InvalidSchema', () => {
    const res = safePublishLinkableGlobalContract({ wasmBase64: '###' });
    assertNatErrKind(res, 'CreateAction.PublishLinkableGlobalContract.Args.InvalidSchema');
  });
});
