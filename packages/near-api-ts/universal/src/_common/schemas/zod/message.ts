import * as z from 'zod/mini';
import { AccountIdZodSchema } from './common/accountId';
import { Base64StringZodSchema } from './common/base64String';
import { PublicKeyZodSchema } from './common/publicKey';
import { SignatureZodSchema } from './common/signature';

export const NonceSchema = z
  .pipe(
    Base64StringZodSchema,
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
  signerAccountId: AccountIdZodSchema,
  signerPublicKey: PublicKeyZodSchema,
  message: MessageSchema,
  signature: SignatureZodSchema,
});
