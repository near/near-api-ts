import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../../_common/zodSchemas/accountId';
import { PublicKeyZodSchema } from '../../../_common/zodSchemas/publicKey';
import { SignatureZodSchema } from '../../../_common/zodSchemas/signature';
import { Base64StringZodSchema } from './base64String';

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
