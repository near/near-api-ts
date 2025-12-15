import { describe, it } from 'vitest';
import {
  addFunctionCallKey,
  randomEd25519KeyPair,
  safeAddFunctionCallKey,
} from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('addFunctionCallKey action', () => {
  it('Ok', () => {
    addFunctionCallKey({
      publicKey: randomEd25519KeyPair().publicKey,
      contractAccountId: 'nat',
    });

    addFunctionCallKey({
      publicKey: randomEd25519KeyPair().publicKey,
      contractAccountId: 'nat',
      gasBudget: { near: '0.5' },
      allowedFunctions: ['new'],
    });
  });

  it('InvalidSchema - no args', () => {
    // @ts-expect-error
    const res = safeAddFunctionCallKey();
    assertNatErrKind(res, 'CreateAction.AddFunctionCallKey.Args.InvalidSchema');
  });

  it('InvalidSchema - invalid publicKey', () => {
    // @ts-expect-error
    const res = safeAddFunctionCallKey({ publicKey: '123' });
    assertNatErrKind(res, 'CreateAction.AddFunctionCallKey.Args.InvalidSchema');
  });

  it('InvalidSchema - invalid publicKey', () => {
    const res = safeAddFunctionCallKey({
      publicKey: randomEd25519KeyPair().publicKey,
      contractAccountId: 'nat',
      allowedFunctions: [],
    });
    assertNatErrKind(res, 'CreateAction.AddFunctionCallKey.Args.InvalidSchema');
  });
});
