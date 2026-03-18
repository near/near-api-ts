import * as z from 'zod/mini';
import type { SafeCreateMessage, CreateMessage } from '../../../types/_common/message';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { resultNatError } from '../../_common/natError';
import { result } from '../../_common/utils/result';
import { JsonValueSchema } from '../../_common/schemas/zod/common/common';
import { asThrowable } from '../../_common/utils/asThrowable';
import { Nep413Message } from '../../_common/configs/constants';

export const CreateMessageArgsSchema = z.object({
  message: JsonValueSchema,
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
