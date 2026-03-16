import * as z from 'zod/mini';
import type { SafeCreateMessage, CreateMessage } from '@universal/types/_common/message';
import { wrapInternalError } from '@universal/src/_common/utils/wrapInternalError';
import { resultNatError } from '@universal/src/_common/natError';
import { result } from '@universal/src/_common/utils/result';
import { JsonValueSchema } from '@universal/src/_common/schemas/zod/common/common';
import { asThrowable } from '@universal/src/_common/utils/asThrowable';
import { Nep413Message } from '@universal/src/_common/configs/constants';

export const CreateMessageArgsSchema = z.object({
  data: JsonValueSchema,
  requester: z.string(),
  nonce: z.optional(z.instanceof(Uint8Array).check(z.length(Nep413Message.NonceLength))),
});

export const safeCreateMessage: SafeCreateMessage = wrapInternalError(
  'CreateMessage.Internal',
  (args) => {
    const validArgs = CreateMessageArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateMessage.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const nonce =
      validArgs.data.nonce ?? crypto.getRandomValues(new Uint8Array(Nep413Message.NonceLength));
    const base64Nonce = nonce.toBase64();

    const stringifiedData =
      typeof validArgs.data.data === 'string'
        ? validArgs.data.data
        : JSON.stringify(validArgs.data.data);

    return result.ok({
      data: stringifiedData,
      requester: args.requester,
      nonce: base64Nonce,
    });
  },
);

export const createMessage: CreateMessage = asThrowable(safeCreateMessage);
