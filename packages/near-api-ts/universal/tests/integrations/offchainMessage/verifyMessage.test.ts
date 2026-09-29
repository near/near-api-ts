import { sha256 } from '@noble/hashes/sha2.js';
import { serialize } from 'borsh';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addAccessKey,
  type Client,
  createMemoryKeyService,
  createMemorySigner,
  createMessage,
  keyPair,
  type Message,
  type PublicKey,
  randomEd25519KeyPair,
  randomMlDsa65KeyPair,
  type Signature,
  verifyMessage,
} from '../../../index';
import { Nep413Message } from '../../../src/_common/_common/_common/constants';
import { createDefaultClient } from '../../utils/common';
import { startSandbox } from '../../utils/sandbox/startSandbox';
import { startFakeRpc } from '../../utils/startFakeRpc';

// What a wallet does on its side: sign sha256(borsh(NEP-413 payload)).
const signMessage = async (
  message: Message,
  signerKeyPair: {
    publicKey: PublicKey;
    signData: (args: { dataU8: Uint8Array }) => Promise<{ signature: Signature }>;
  },
) => {
  const payload = serialize(
    {
      struct: {
        tag: 'u32',
        message: 'string',
        nonce: { array: { type: 'u8', len: 32 } },
        recipient: 'string',
        callbackUrl: { option: 'string' },
      },
    },
    {
      tag: Nep413Message.Tag,
      message: message.message,
      nonce: Uint8Array.fromBase64(message.nonce),
      recipient: message.recipient,
    },
  );
  const { signature } = await signerKeyPair.signData({ dataU8: sha256(payload) });

  return {
    signerAccountId: 'nat',
    signerPublicKey: signerKeyPair.publicKey,
    message,
    signature,
  };
};

describe('verifyMessage', () => {
  let client: Client;
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);
  const mlDsa65KeyPair = randomMlDsa65KeyPair();
  const message = createMessage({ message: 'Sign in', recipient: 'app.near' });

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);

    const signer = createMemorySigner({
      signerAccountId: 'nat',
      keyService: createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } }),
      client,
    });

    await signer.executeTransaction({
      intent: {
        action: addAccessKey({
          publicKey: mlDsa65KeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
        receiverAccountId: 'nat',
      },
    });

    return () => sandbox.stop();
  });

  it('accepts a message signed by an ed25519 full access key', async () => {
    const signedMessage = await signMessage(message, defaultKeyPair);
    await expect(verifyMessage({ signedMessage, message, client })).resolves.toBe(true);
  });

  // The node lists an ml-dsa-65 key by its hash, not by the key itself
  it('accepts a message signed by an ml-dsa-65 full access key', async () => {
    const signedMessage = await signMessage(message, mlDsa65KeyPair);
    await expect(verifyMessage({ signedMessage, message, client })).resolves.toBe(true);
  });

  it('rejects a message signed by a key the account does not have', async () => {
    const signedMessage = await signMessage(message, randomMlDsa65KeyPair());
    await expect(verifyMessage({ signedMessage, message, client })).resolves.toBe(false);
  });

  // A key paid from its own balance (a gas key) has the same permission as any other;
  // the sandbox cannot add one yet, so a fake node lists them
  describe('keys paid from the key balance', () => {
    const fullAccessKeyPair = randomEd25519KeyPair();
    const functionCallKeyPair = randomEd25519KeyPair();

    const startGasKeysRpc = () =>
      startFakeRpc({
        keys: [
          {
            public_key: fullAccessKeyPair.publicKey,
            access_key: {
              nonce: 0,
              permission: { GasKeyFullAccess: { balance: '1000', num_nonces: 4 } },
            },
          },
          {
            public_key: functionCallKeyPair.publicKey,
            access_key: {
              nonce: 0,
              permission: {
                GasKeyFunctionCall: {
                  balance: '1000',
                  num_nonces: 4,
                  allowance: null,
                  receiver_id: 'app.near',
                  method_names: [],
                },
              },
            },
          },
        ],
        block_hash: '11111111111111111111111111111111',
        block_height: 1,
      });

    it('accepts a message signed by a full access key', async () => {
      const { fakeClient, close } = await startGasKeysRpc();
      const signedMessage = await signMessage(message, fullAccessKeyPair);
      const isValid = await verifyMessage({ signedMessage, message, client: fakeClient });
      close();

      expect(isValid).toBe(true);
    });

    it('rejects a message signed by a function call key', async () => {
      const { fakeClient, close } = await startGasKeysRpc();
      const signedMessage = await signMessage(message, functionCallKeyPair);
      const isValid = await verifyMessage({ signedMessage, message, client: fakeClient });
      close();

      expect(isValid).toBe(false);
    });
  });
});
