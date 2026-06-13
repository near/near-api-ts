import { describe, it } from 'vitest';
import { addFullAccessKey, randomEd25519KeyPair, safeAddFullAccessKey } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('addFullAccessKey', () => {
  it('creates an action from a valid public key', () => {
    addFullAccessKey({ publicKey: randomEd25519KeyPair().publicKey });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeAddFullAccessKey();
    assertNatErrKind(res, 'CreateAction.AddFullAccessKey.Args.InvalidSchema');
  });

  it('rejects an invalid public key with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeAddFullAccessKey({ publicKey: '123' });
    assertNatErrKind(res, 'CreateAction.AddFullAccessKey.Args.InvalidSchema');
  });
});
