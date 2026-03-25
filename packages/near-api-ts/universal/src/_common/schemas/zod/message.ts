import * as z from 'zod/mini';
import { AccountIdSchema } from './common/accountId';
import { Base64StringSchema } from './common/base64String';
import { PublicKeySchema } from './common/publicKey';
import { SignatureSchema } from './common/signature';

export const NonceSchema = z
  .pipe(
    Base64StringSchema,
    z.transform((nonce) => {
      const u8Nonce = Uint8Array.fromBase64(nonce);
      return { nonce, u8Nonce };
    }),
  )
  .check(
    z.refine(({ u8Nonce }) => u8Nonce.length === 32, {
      error: 'Binary nonce length should be 32 bytes',
    }),
  );

export const MessageSchema = z.object({
  message: z.string(),
  recipient: z.string(),
  nonce: NonceSchema,
});

export const SignedMessageSchema = z.object({
  signerAccountId: AccountIdSchema,
  signerPublicKey: PublicKeySchema,
  message: MessageSchema,
  signature: SignatureSchema,
});
