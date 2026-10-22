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
  withdrawAccessKeyBalance,
} from '../../../../index';
import { PublicKeyBorshSchema } from '../../../../src/transaction/_common/_common/_common/publicKeyBorshSchema';
import { SignatureBorshSchema } from '../../../../src/transaction/_common/_common/borshSchemas/signature';
import {
  DelegationBorshSchema,
  SignedDelegationBorshSchema,
} from '../../../../src/transaction/_common/delegationBorshSchema';
import { TransactionNonceBorshSchema } from '../../../../src/transaction/signTransaction/transactionBorshSchema/transactionNonce';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('executeDelegation', () => {
  const keyPair = randomEd25519KeyPair();

  // Borsh reads the amount back as a bigint, so it is given as one to compare equal
  const delegation = {
    receiverAccountId: 'bob',
    delegatedAction: transfer({ amount: { yoctoNear: 1n } }),
    expiration: { blockHeight: 1000 },
  };

  it('reads back a delegation signDelegation signed', async () => {
    const { signedDelegation, signedDelegationBorsh64 } = await signDelegation({
      signDataProvider: keyPair,
      delegation: {
        ...delegation,
        delegator: {
          accountId: 'alice',
          publicKey: keyPair.publicKey,
          replayProtection: { nonce: 7 },
        },
      },
    });

    expect(signedDelegation.delegation.tag).toBe(constants.Delegation.Nep366Tag);
    expect(signedDelegation.delegation.delegator.replayProtection).toStrictEqual({ nonce: 7 });
    expect(executeDelegation({ signedDelegationBorsh64 })).toStrictEqual({
      actionType: 'ExecuteDelegation',
      signedDelegation,
    });
  });

  // Borsh reads the allowance back as a bigint, so it is given as one to compare equal
  it('reads back an AddAccessKey action of each key variant', async () => {
    const permission = {
      kind: 'ContractFunctionCall' as const,
      allowedContract: 'bob',
      allowedFunctions: ['ping'],
    };

    const { signedDelegation, signedDelegationBorsh64 } = await signDelegation({
      signDataProvider: keyPair,
      delegation: {
        delegator: {
          accountId: 'alice',
          publicKey: keyPair.publicKey,
          replayProtection: { nonce: 7 },
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

  it('reads a delegation signed elsewhere', async () => {
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
      dataU8: sha256(serialize(DelegationBorshSchema, nearcoreDelegation)),
    });

    const signedDelegationBorsh64 = serialize(SignedDelegationBorshSchema, {
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
            replayProtection: { nonce: 7 },
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
  const signature = { ed25519Signature: { data: new Uint8Array(64) } };

  const nep366DelegationU8 = serialize(SignedDelegationBorshSchema, {
    delegation: {
      senderId: 'alice',
      receiverId: 'bob',
      actions: [{ transfer: { deposit: 1n } }],
      nonce: 7n,
      maxBlockHeight: 1000n,
      publicKey: { ed25519Key: { data: keyPair.publicKeyU8 } },
    },
    signature,
  });

  const executeDelegationOf = (signedDelegationU8: Uint8Array) =>
    safeExecuteDelegation({ signedDelegationBorsh64: signedDelegationU8.toBase64() });

  const expectDeserializeFailed = (
    res: ReturnType<typeof safeExecuteDelegation>,
    causeMessage: string,
  ) => {
    assertNatErrKind(res, 'CreateAction.ExecuteDelegation.SignedDelegation.Deserialize.Failed');
    expect(String(res.error.context.cause)).toContain(causeMessage);
  };

  it('rejects bytes left over after the delegation', () => {
    expectDeserializeFailed(
      executeDelegationOf(new Uint8Array([...nep366DelegationU8, 0])),
      'Bytes left over after the borsh value: 1',
    );
  });

  // Nearcore `VersionedSignedDelegateAction`: the payload discriminant (0 for V2) goes first, and
  // the nonce may name a nonce channel. Nearcore refuses this format since protocol 87. The
  // action list is left empty, so its element type does not matter.
  it('rejects a delegation in the NEP-611 format', () => {
    const nep611DelegationU8 = serialize(
      {
        struct: {
          delegation: {
            struct: {
              version: 'u8',
              senderId: 'string',
              receiverId: 'string',
              actions: { array: { type: 'u8' } },
              nonce: TransactionNonceBorshSchema,
              maxBlockHeight: 'u64',
              publicKey: PublicKeyBorshSchema,
            },
          },
          signature: SignatureBorshSchema,
        },
      },
      {
        delegation: {
          version: 0,
          senderId: 'alice',
          receiverId: 'bob',
          actions: [],
          nonce: { gasKeyNonce: { nonce: 7n, nonceIndex: 1 } },
          maxBlockHeight: 1000n,
          publicKey: { ed25519Key: { data: keyPair.publicKeyU8 } },
        },
        signature,
      },
    );

    const res = executeDelegationOf(nep611DelegationU8);
    assertNatErrKind(res, 'CreateAction.ExecuteDelegation.SignedDelegation.Deserialize.Failed');
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

describe('signDelegation › delegated actions', () => {
  const keyPair = randomEd25519KeyPair();

  // Nearcore refuses a withdrawal from a key balance inside any delegation since protocol 87
  it('rejects a WithdrawAccessKeyBalance action', async () => {
    const res = await safeSignDelegation({
      signDataProvider: keyPair,
      delegation: {
        delegator: {
          accountId: 'alice',
          publicKey: keyPair.publicKey,
          replayProtection: { nonce: 1 },
        },
        receiverAccountId: 'alice',
        // @ts-expect-error - not a delegable action
        delegatedAction: withdrawAccessKeyBalance({
          publicKey: keyPair.publicKey,
          amount: { near: '1' },
        }),
        expiration: { blockHeight: 1000 },
      },
    });

    assertNatErrKind(res, 'SignDelegation.Args.InvalidSchema');
  });
});
