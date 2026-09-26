import { sha256 } from '@noble/hashes/sha2.js';
import { serialize } from 'borsh';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createMemoryKeyService,
  createMemorySigner,
  createMessage,
  keyPair,
  type Message,
  type PublicKey,
  randomMlDsa65KeyPair,
  type Signature,
  verifyMessage,
} from '../../../index';
import { Nep413Message } from '../../../src/_common/_common/_common/constants';
import { createDefaultClient } from '../../utils/common';
import { startSandbox } from '../../utils/sandbox/startSandbox';

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
        action: addFullAccessKey({ publicKey: mlDsa65KeyPair.publicKey }),
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
});
