import { sha256 } from '@noble/hashes/sha2.js';
import { serialize } from 'borsh';
import { describe, expect, it } from 'vitest';
import {
  addAccessKey,
  constants,
  executeDelegation,
  randomEd25519KeyPair,
  safeExecuteDelegation,
  safeSignDelegation,
  signDelegation,
  transfer,
} from '../../../../index';
import {
  DelegationV1BorshSchema,
  SignedDelegationV1BorshSchema,
} from '../../../../src/transaction/_common/delegationBorshSchema';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('executeDelegation', () => {
  const keyPair = randomEd25519KeyPair();

  // Borsh reads the amount back as a bigint, so it is given as one to compare equal
  const delegation = {
    receiverAccountId: 'bob',
    delegatedAction: transfer({ amount: { yoctoNear: 1n } }),
    expiration: { blockHeight: 1000 },
  };

  it('reads back a delegation signed on the single nonce channel', async () => {
    const { signedDelegation, signedDelegationBorsh64 } = await signDelegation({
      signDataProvider: keyPair,
      delegation: {
        ...delegation,
        delegator: {
          accountId: 'alice',
          publicKey: keyPair.publicKey,
          replayProtection: { scheme: 'NonceChannel', nonce: 7 },
        },
      },
    });

    expect(signedDelegation.delegation.tag).toBe(constants.Delegation.Nep611Tag);
    expect(executeDelegation({ signedDelegationBorsh64 })).toStrictEqual({
      actionType: 'ExecuteDelegation',
      signedDelegation,
    });
  });

  it('reads back a delegation signed on one of many nonce channels', async () => {
    const { signedDelegation, signedDelegationBorsh64 } = await signDelegation({
      signDataProvider: keyPair,
      delegation: {
        ...delegation,
        delegator: {
          accountId: 'alice',
          publicKey: keyPair.publicKey,
          replayProtection: { scheme: 'NonceChannels', nonceChannelId: 1023, nonce: 7 },
        },
      },
    });

    expect(executeDelegation({ signedDelegationBorsh64 })).toStrictEqual({
      actionType: 'ExecuteDelegation',
      signedDelegation,
    });
  });

  // Borsh reads the allowance back as a bigint, so it is given as one to compare equal
  it('reads back an AddAccessKey action of each key variant', async () => {
    const permission = {
      kind: 'FunctionCall' as const,
      allowedContract: 'bob',
      allowedFunctions: ['ping'],
    };

    const { signedDelegation, signedDelegationBorsh64 } = await signDelegation({
      signDataProvider: keyPair,
      delegation: {
        delegator: {
          accountId: 'alice',
          publicKey: keyPair.publicKey,
          replayProtection: { scheme: 'NonceChannel', nonce: 7 },
        },
        receiverAccountId: 'alice',
        expiration: { blockHeight: 1000 },
        delegatedActions: [
          addAccessKey({
            publicKey: keyPair.publicKey,
            permission: { kind: 'FullAccess' },
            gasPayment: { source: 'AccountBalance' },
          }),
          addAccessKey({
            publicKey: keyPair.publicKey,
            permission,
            gasPayment: { source: 'AccountBalance', allowance: { yoctoNear: 1000n } },
          }),
          addAccessKey({
            publicKey: keyPair.publicKey,
            permission: { kind: 'FullAccess' },
            gasPayment: { source: 'KeyBalance' },
            replayProtection: { channelCount: 1024 },
          }),
          addAccessKey({
            publicKey: keyPair.publicKey,
            permission,
            gasPayment: { source: 'KeyBalance' },
            replayProtection: { channelCount: 3 },
          }),
        ],
      },
    });

    expect(executeDelegation({ signedDelegationBorsh64 })).toStrictEqual({
      actionType: 'ExecuteDelegation',
      signedDelegation,
    });
  });

  it('reads a delegation signed in the NEP-366 format', async () => {
    const nearcoreDelegation = {
      tag: constants.Delegation.Nep366Tag,
      senderId: 'alice',
      receiverId: 'bob',
      actions: [{ transfer: { deposit: 1n } }],
      nonce: 7n,
      maxBlockHeight: 1000n,
      publicKey: { ed25519Key: { data: keyPair.publicKeyU8 } },
    };

    const { signature, signatureU8 } = await keyPair.signData({
      dataU8: sha256(serialize(DelegationV1BorshSchema, nearcoreDelegation)),
    });

    const signedDelegationBorsh64 = serialize(SignedDelegationV1BorshSchema, {
      delegation: nearcoreDelegation,
      signature: { ed25519Signature: { data: signatureU8 } },
    }).toBase64();

    expect(executeDelegation({ signedDelegationBorsh64 })).toStrictEqual({
      actionType: 'ExecuteDelegation',
      signedDelegation: {
        delegation: {
          tag: constants.Delegation.Nep366Tag,
          delegator: {
            accountId: 'alice',
            publicKey: keyPair.publicKey,
            replayProtection: { scheme: 'NonceChannel', nonce: 7 },
          },
          receiverAccountId: 'bob',
          expiration: { blockHeight: 1000 },
          delegatedActions: [{ actionType: 'Transfer', amount: { yoctoNear: 1n } }],
        },
        signature,
      },
    });
  });

  it('rejects bytes that are no signed delegation with Deserialize.Failed', () => {
    const res = safeExecuteDelegation({ signedDelegationBorsh64: 'AAAA' });
    assertNatErrKind(res, 'CreateAction.ExecuteDelegation.SignedDelegation.Deserialize.Failed');
  });
});

describe('executeDelegation › malformed bytes', () => {
  const keyPair = randomEd25519KeyPair();

  // The signature is never checked here, only its encoding
  const nep366DelegationU8 = serialize(SignedDelegationV1BorshSchema, {
    delegation: {
      senderId: 'alice',
      receiverId: 'bob',
      actions: [{ transfer: { deposit: 1n } }],
      nonce: 7n,
      maxBlockHeight: 1000n,
      publicKey: { ed25519Key: { data: keyPair.publicKeyU8 } },
    },
    signature: { ed25519Signature: { data: new Uint8Array(64) } },
  });

  const getNep611DelegationU8 = async () => {
    const { signedDelegationBorsh64 } = await signDelegation({
      signDataProvider: keyPair,
      delegation: {
        delegator: {
          accountId: 'alice',
          publicKey: keyPair.publicKey,
          replayProtection: { scheme: 'NonceChannels', nonceChannelId: 1, nonce: 7 },
        },
        receiverAccountId: 'bob',
        delegatedAction: transfer({ amount: { yoctoNear: 1n } }),
        expiration: { blockHeight: 1000 },
      },
    });

    return Uint8Array.fromBase64(signedDelegationBorsh64);
  };

  const executeDelegationOf = (signedDelegationU8: Uint8Array) =>
    safeExecuteDelegation({ signedDelegationBorsh64: signedDelegationU8.toBase64() });

  const expectDeserializeFailed = (
    res: ReturnType<typeof safeExecuteDelegation>,
    causeMessage: string,
  ) => {
    assertNatErrKind(res, 'CreateAction.ExecuteDelegation.SignedDelegation.Deserialize.Failed');
    expect(String(res.error.context.cause)).toContain(causeMessage);
  };

  it('rejects bytes left over after a NEP-366 delegation', () => {
    expectDeserializeFailed(
      executeDelegationOf(new Uint8Array([...nep366DelegationU8, 0])),
      'Bytes left over after the borsh value: 1',
    );
  });

  it('rejects bytes left over after a NEP-611 delegation', async () => {
    const nep611DelegationU8 = await getNep611DelegationU8();

    expectDeserializeFailed(
      executeDelegationOf(new Uint8Array([...nep611DelegationU8, 1, 2])),
      'Bytes left over after the borsh value: 2',
    );
  });

  // A payload version nearcore may add later would start with its own discriminant
  it('rejects a payload version other than V2', async () => {
    const nextVersionU8 = await getNep611DelegationU8();
    nextVersionU8[0] = 1;

    expectDeserializeFailed(executeDelegationOf(nextVersionU8), 'Unknown signed delegation format');
  });

  // borsh-js decodes any bytes as a string, nearcore accepts valid UTF-8 only: 0xC3 has to be
  // followed by a continuation byte, and the 'l' of 'alice' is none
  it('rejects a field nearcore would not decode', () => {
    const invalidUtf8U8 = new Uint8Array(nep366DelegationU8);
    invalidUtf8U8[4] = 0xc3; // the 'a' of 'alice', right after its u32 length

    expectDeserializeFailed(
      executeDelegationOf(invalidUtf8U8),
      'not encoded the way borsh encodes the value',
    );
  });
});

describe('signDelegation › delegator.replayProtection', () => {
  const keyPair = randomEd25519KeyPair();

  const sign = (replayProtection: Record<string, unknown>) =>
    safeSignDelegation({
      signDataProvider: keyPair,
      delegation: {
        delegator: {
          accountId: 'alice',
          publicKey: keyPair.publicKey,
          // @ts-expect-error - the cases below are invalid on purpose
          replayProtection,
        },
        receiverAccountId: 'bob',
        delegatedAction: transfer({ amount: { yoctoNear: '1' } }),
        expiration: { blockHeight: 1000 },
      },
    });

  it('rejects a nonce channel id with the NonceChannel scheme', async () => {
    const res = await sign({ scheme: 'NonceChannel', nonceChannelId: 0, nonce: 1 });
    assertNatErrKind(res, 'SignDelegation.Args.InvalidSchema');
  });

  it('rejects a nonce channel id out of range', async () => {
    const res = await sign({ scheme: 'NonceChannels', nonceChannelId: 1024, nonce: 1 });
    assertNatErrKind(res, 'SignDelegation.Args.InvalidSchema');
  });
});
