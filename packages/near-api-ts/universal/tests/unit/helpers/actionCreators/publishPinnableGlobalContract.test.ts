import { describe, expect, it } from 'vitest';
import {
  publishPinnableGlobalContract,
  safePublishPinnableGlobalContract,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('publishPinnableGlobalContract', () => {
  it('creates a pinnable action from wasmU8', () => {
    const wasmU8 = Uint8Array.from([1, 2, 3]);

    expect(publishPinnableGlobalContract({ wasmU8 })).toEqual({
      actionType: 'PublishPinnableGlobalContract',
      wasmU8,
    });
  });

  it('creates a pinnable action from wasmBase64', () => {
    expect(publishPinnableGlobalContract({ wasmBase64: 'AQID' })).toEqual({
      actionType: 'PublishPinnableGlobalContract',
      wasmU8: Uint8Array.from([1, 2, 3]),
    });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safePublishPinnableGlobalContract();
    assertNatErrKind(res, 'CreateAction.PublishPinnableGlobalContract.Args.InvalidSchema');
  });

  it('rejects invalid wasmBase64 with Args.InvalidSchema', () => {
    const res = safePublishPinnableGlobalContract({ wasmBase64: '###' });
    assertNatErrKind(res, 'CreateAction.PublishPinnableGlobalContract.Args.InvalidSchema');
  });
});
