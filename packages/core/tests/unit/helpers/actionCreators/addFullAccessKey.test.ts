import { describe, it } from 'vitest';
import {
  addFullAccessKey,
  randomEd25519KeyPair,
  safeAddFullAccessKey,
} from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('Add Full Access key action', () => {
  it('Ok', () => {
    addFullAccessKey({ publicKey: randomEd25519KeyPair().publicKey });
  });

  it('InvalidSchema - no args', () => {
    // @ts-expect-error
    const res = safeAddFullAccessKey();
    assertNatErrKind(res, 'CreateAction.AddFullAccessKey.Args.InvalidSchema');
  });

  it('InvalidSchema - invalid amount', () => {
    // @ts-expect-error
    const res = safeAddFullAccessKey({ publicKey: '123' });
    assertNatErrKind(res, 'CreateAction.AddFullAccessKey.Args.InvalidSchema');
  });
});
