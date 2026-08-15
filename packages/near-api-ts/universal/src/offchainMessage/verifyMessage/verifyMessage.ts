import { sha256 } from '@noble/hashes/sha2.js';
import { type Schema, serialize } from 'borsh';
import * as z from 'zod/mini';
import type { BorshBytes } from '../../../types/_common/common';
import type { Message, SafeVerifyMessage, VerifyMessage } from '../../../types/_common/message';
import type { SafeGetAccountAccessKeys } from '../../../types/client/methods/account/getAccountAccessKeys';
import { Nep413Message } from '../../_common/_common/_common/constants';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { verifySignature } from './verifySignature';
import { MessageZodSchema, SignedMessageZodSchema } from './zodSchemas/message';

const Nep413MessageBorshSchema: Schema = {
  struct: {
    tag: 'u32',
    message: 'string',
    nonce: { array: { type: 'u8', len: 32 } },
    recipient: 'string',
    callbackUrl: { option: 'string' },
  },
};

const toBorshNep413Message = (message: Message): BorshBytes =>
  serialize(Nep413MessageBorshSchema, {
    tag: Nep413Message.Tag,
    message: message.message,
    recipient: message.recipient,
    nonce: Uint8Array.fromBase64(message.nonce),
  });

export const VerifyMessageArgsSchema = z.object({
  signedMessage: SignedMessageZodSchema,
  message: MessageZodSchema,
  client: z.object({
    safeGetAccountAccessKeys: z.custom<SafeGetAccountAccessKeys>(
      (val) => typeof val === 'function',
      'client.safeGetAccountAccessKeys must be a function',
    ),
  }),
});

export const safeVerifyMessage: SafeVerifyMessage = wrapInternalError(
  'VerifyMessage.Internal',
  async (args) => {
    const validArgs = VerifyMessageArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('VerifyMessage.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { signedMessage, client } = validArgs.data;

    // 1. Check if a provided public key belongs to the account and is a FullAccess key
    const accessKeys = await client.safeGetAccountAccessKeys({
      accountId: signedMessage.signerAccountId,
    });

    if (!accessKeys.ok)
      return resultNatError('VerifyMessage.AccessKeys.NotLoaded', { cause: accessKeys.error });

    const isAccountFullAccessKey = accessKeys.value.accountAccessKeys.some(
      (key) =>
        key.publicKey === signedMessage.signerPublicKey.publicKey &&
        key.accessType === 'FullAccess',
    );
    if (!isAccountFullAccessKey) return result.ok(false);

    // 2. Verify the message signature - we want to make sure that the user
    // really signed the original message by a provided key
    const borshNep413Message = toBorshNep413Message(args.message);
    const messageHashU8 = sha256(borshNep413Message);

    // We sure that verifySignature will never throw an error
    return result.ok(
      verifySignature({
        publicKey: signedMessage.signerPublicKey.publicKey,
        message: messageHashU8,
        signature: signedMessage.signature.signature,
      }),
    );
  },
);

export const verifyMessage: VerifyMessage = asThrowable(safeVerifyMessage);
