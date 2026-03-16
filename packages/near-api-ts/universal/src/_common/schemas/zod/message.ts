import * as z from 'zod/mini';
import { Base64StringSchema } from '@universal/src/_common/schemas/zod/common/base64String';
import { SignatureSchema } from '@universal/src/_common/schemas/zod/common/signature';
import { AccountIdSchema } from '@universal/src/_common/schemas/zod/common/accountId';
import { PublicKeySchema } from '@universal/src/_common/schemas/zod/common/publicKey';

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
  data: z.string(),
  requester: z.string(),
  nonce: NonceSchema,
});

export const SignedMessageSchema = z.object({
  signerAccountId: AccountIdSchema,
  signerPublicKey: PublicKeySchema,
  message: MessageSchema,
  signature: SignatureSchema,
});
