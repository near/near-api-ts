import { describe, it } from 'vitest';
import {
  addFunctionCallKey,
  randomEd25519KeyPair,
  safeAddFunctionCallKey,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('addFunctionCallKey', () => {
  it('creates an action with various gasBudget and allowedFunctions options', () => {
    addFunctionCallKey({
      publicKey: randomEd25519KeyPair().publicKey,
      contractAccountId: 'nat',
      gasBudget: 'Unlimited',
      allowedFunctions: 'AllNonPayable',
    });

    addFunctionCallKey({
      publicKey: randomEd25519KeyPair().publicKey,
      contractAccountId: 'nat',
      gasBudget: { near: '0.5' },
      allowedFunctions: ['new'],
    });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeAddFunctionCallKey();
    assertNatErrKind(res, 'CreateAction.AddFunctionCallKey.Args.InvalidSchema');
  });

  it('rejects an invalid public key with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeAddFunctionCallKey({ publicKey: '123' });
    assertNatErrKind(res, 'CreateAction.AddFunctionCallKey.Args.InvalidSchema');
  });

  it('rejects an empty allowedFunctions list with Args.InvalidSchema', () => {
    const res = safeAddFunctionCallKey({
      publicKey: randomEd25519KeyPair().publicKey,
      contractAccountId: 'nat',
      gasBudget: 'Unlimited',
      allowedFunctions: [],
    });
    assertNatErrKind(res, 'CreateAction.AddFunctionCallKey.Args.InvalidSchema');
  });
});
