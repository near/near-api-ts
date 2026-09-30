import { describe, expect, it } from 'vitest';
import { addAccessKey, near, randomEd25519KeyPair, safeAddAccessKey } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

const publicKey = randomEd25519KeyPair().publicKey;

const functionCallPermission = {
  kind: 'FunctionCall' as const,
  allowedContract: 'nat',
  allowedFunctions: 'AllNonPayable' as const,
};

describe('addAccessKey', () => {
  it('creates an AddKey action for each key variant', () => {
    const variants = [
      {
        publicKey,
        permission: { kind: 'FullAccess' as const },
        gasPayment: { source: 'AccountBalance' as const },
      },
      {
        publicKey,
        permission: functionCallPermission,
        gasPayment: { source: 'AccountBalance' as const, allowance: 'Unlimited' as const },
      },
      {
        publicKey,
        permission: { ...functionCallPermission, allowedFunctions: ['new'] },
        gasPayment: { source: 'AccountBalance' as const, allowance: near('0.5') },
      },
      {
        publicKey,
        permission: { kind: 'FullAccess' as const },
        gasPayment: { source: 'KeyBalance' as const },
        replayProtection: { channelCount: 1 },
      },
      {
        publicKey,
        permission: functionCallPermission,
        gasPayment: { source: 'KeyBalance' as const },
        replayProtection: { channelCount: 1024 },
      },
    ];

    for (const args of variants)
      expect(addAccessKey(args)).toStrictEqual({ actionType: 'AddAccessKey', ...args });
  });

  it('rejects missing args with Args.InvalidSchema', () => {
    // @ts-expect-error
    const res = safeAddAccessKey();
    assertNatErrKind(res, 'CreateAction.AddAccessKey.Args.InvalidSchema');
  });

  it('rejects an invalid public key with Args.InvalidSchema', () => {
    const res = safeAddAccessKey({
      // @ts-expect-error
      publicKey: '123',
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance' },
    });
    assertNatErrKind(res, 'CreateAction.AddAccessKey.Args.InvalidSchema');
  });

  it('rejects an empty allowedFunctions list with Args.InvalidSchema', () => {
    const res = safeAddAccessKey({
      publicKey,
      permission: { ...functionCallPermission, allowedFunctions: [] },
      gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
    });
    assertNatErrKind(res, 'CreateAction.AddAccessKey.Args.InvalidSchema');
  });

  it('rejects a FunctionCall key paid from the account balance without an allowance', () => {
    // @ts-expect-error
    const res = safeAddAccessKey({
      publicKey,
      permission: functionCallPermission,
      gasPayment: { source: 'AccountBalance' },
    });
    assertNatErrKind(res, 'CreateAction.AddAccessKey.Args.InvalidSchema');
  });

  // Nearcore has no allowance for a full access key; dropping it would add an unlimited key
  it('rejects an allowance on a FullAccess key', () => {
    // @ts-expect-error
    const res = safeAddAccessKey({
      publicKey,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance', allowance: near('1') },
    });
    assertNatErrKind(res, 'CreateAction.AddAccessKey.Args.InvalidSchema');
  });

  // Dropping it would add an ordinary key instead of the gas key the caller asked for
  it('rejects replayProtection on a key paid from the account balance', () => {
    // @ts-expect-error
    const res = safeAddAccessKey({
      publicKey,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance' },
      replayProtection: { channelCount: 4 },
    });
    assertNatErrKind(res, 'CreateAction.AddAccessKey.Args.InvalidSchema');
  });

  it('rejects a key paid from its own balance without replayProtection', () => {
    // @ts-expect-error
    const res = safeAddAccessKey({
      publicKey,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'KeyBalance' },
    });
    assertNatErrKind(res, 'CreateAction.AddAccessKey.Args.InvalidSchema');
  });

  // nearcore 2.13.4 rejects an allowance on a gas key (GasKeyFunctionCallAllowanceNotAllowed)
  it('rejects an allowance on a key paid from its own balance', () => {
    const res = safeAddAccessKey({
      publicKey,
      permission: functionCallPermission,
      // @ts-expect-error
      gasPayment: { source: 'KeyBalance', allowance: 'Unlimited' },
      replayProtection: { channelCount: 4 },
    });
    assertNatErrKind(res, 'CreateAction.AddAccessKey.Args.InvalidSchema');
  });

  it('rejects channelCount outside 1..1024 or not an integer', () => {
    for (const channelCount of [0, 1025, 1.5])
      assertNatErrKind(
        safeAddAccessKey({
          publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount },
        }),
        'CreateAction.AddAccessKey.Args.InvalidSchema',
      );
  });
});
