import { describe, it } from 'vitest';
import { deleteKey, randomEd25519KeyPair, safeDeleteKey } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('Delete Key action', () => {
  it('Ok', () => {
    deleteKey({ publicKey: randomEd25519KeyPair().publicKey });
  });

  it('InvalidSchema - no args', () => {
    // @ts-expect-error
    const res = safeDeleteKey();
    assertNatErrKind(res, 'CreateAction.DeleteKey.Args.InvalidSchema');
  });

  it('InvalidSchema - invalid amount', () => {
    // @ts-expect-error
    const res = safeDeleteKey({ publicKey: '###' });
    assertNatErrKind(res, 'CreateAction.DeleteKey.Args.InvalidSchema');
  });
});
