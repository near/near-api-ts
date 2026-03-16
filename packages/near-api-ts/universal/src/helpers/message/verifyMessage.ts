import * as z from 'zod/mini';
import type { SafeVerifyMessage, VerifyMessage } from '@universal/types/_common/message';
import { SignedMessageSchema, MessageSchema } from '@universal/src/_common/schemas/zod/message';
import type { SafeGetAccountAccessKeys } from '@universal/types/client/methods/account/getAccountAccessKeys';
import { wrapInternalError } from '@universal/src/_common/utils/wrapInternalError';
import { resultNatError } from '@universal/src/_common/natError';
import { toBorshNep413Message } from '@universal/src/_common/transformers/toBorshBytes/message';
import { sha256 } from '@noble/hashes/sha2';
import { verifySignature } from '@universal/src/helpers/verifySignature';
import { result } from '@universal/src/_common/utils/result';
import { asThrowable } from '@universal/src/_common/utils/asThrowable';

export const VerifyMessageArgsSchema = z.object({
  signedMessage: SignedMessageSchema,
  originMessage: MessageSchema,
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
    const borshNep413Message = toBorshNep413Message(args.originMessage);
    const u8MessageHash = sha256(borshNep413Message);

    // We sure that verifySignature will never throw an error
    return result.ok(
      verifySignature({
        publicKey: signedMessage.signerPublicKey.publicKey,
        message: u8MessageHash,
        signature: signedMessage.signature.signature,
      }),
    );
  },
);

export const verifyMessage: VerifyMessage = asThrowable(safeVerifyMessage);
