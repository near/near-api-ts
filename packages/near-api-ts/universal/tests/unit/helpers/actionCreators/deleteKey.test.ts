import { describe, it } from 'vitest';
import { deleteKey, randomEd25519KeyPair, safeDeleteKey } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('deleteKey', () => {
  it('creates an action from a valid public key', () => {
    deleteKey({ publicKey: randomEd25519KeyPair().publicKey });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeDeleteKey();
    assertNatErrKind(res, 'CreateAction.DeleteKey.Args.InvalidSchema');
  });

  it('rejects an invalid public key with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeDeleteKey({ publicKey: '###' });
    assertNatErrKind(res, 'CreateAction.DeleteKey.Args.InvalidSchema');
  });
});
