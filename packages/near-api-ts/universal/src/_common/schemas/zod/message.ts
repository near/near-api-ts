import * as z from 'zod/mini';
import { AccountIdZodSchema } from './common/accountId';
import { Base64StringZodSchema } from './common/base64String';
import { PublicKeyZodSchema } from './common/publicKey';
import { SignatureZodSchema } from './common/signature';

export const MessageNonceZodSchema = z
  .pipe(
    Base64StringZodSchema,
    z.transform((nonce) => {
      const nonceU8 = Uint8Array.fromBase64(nonce);
      return { nonce, nonceU8 };
    }),
  )
  .check(
    z.refine(({ nonceU8 }) => nonceU8.length === 32, {
      error: 'Binary nonce length should be 32 bytes',
    }),
  );

export const MessageZodSchema = z.object({
  message: z.string(),
  recipient: z.string(),
  nonce: MessageNonceZodSchema,
});

export const SignedMessageZodSchema = z.object({
  signerAccountId: AccountIdZodSchema,
  signerPublicKey: PublicKeyZodSchema,
  message: MessageZodSchema,
  signature: SignatureZodSchema,
});
