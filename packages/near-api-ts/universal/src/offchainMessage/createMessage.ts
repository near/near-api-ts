import * as z from 'zod/mini';
import type { CreateMessage, SafeCreateMessage } from '../../types/_common/message';
import { Nep413Message } from '../_common/_common/_common/constants';
import { result, resultNatError } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { JsonValueZodSchema } from '../_common/zodSchemas/jsonValue';

export const CreateMessageArgsSchema = z.object({
  message: JsonValueZodSchema,
  recipient: z.string(),
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
      typeof validArgs.data.message === 'string'
        ? validArgs.data.message
        : JSON.stringify(validArgs.data.message);

    return result.ok({
      message: stringifiedData,
      recipient: args.recipient,
      nonce: base64Nonce,
    });
  },
);

export const createMessage: CreateMessage = asThrowable(safeCreateMessage);
