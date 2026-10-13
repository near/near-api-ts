import { describe, it } from 'vitest';
import { deleteAccessKey, randomEd25519KeyPair, safeDeleteAccessKey } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('deleteAccessKey', () => {
  it('creates an action from a valid public key', () => {
    deleteAccessKey({ publicKey: randomEd25519KeyPair().publicKey });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeDeleteAccessKey();
    assertNatErrKind(res, 'CreateAction.DeleteAccessKey.Args.InvalidSchema');
  });

  it('rejects an invalid public key with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeDeleteAccessKey({ publicKey: '###' });
    assertNatErrKind(res, 'CreateAction.DeleteAccessKey.Args.InvalidSchema');
  });
});
