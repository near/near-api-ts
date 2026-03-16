import { serialize } from 'borsh';
import { Nep413MessageSchema } from '@universal/src/_common/schemas/borsh/nep413Message';
import { Nep413Message } from '@universal/src/_common/configs/constants';
import type { Message } from '@universal/types/_common/message';
import type { BorshBytes } from '@universal/types/_common/common';

export const toBorshNep413Message = (message: Message): BorshBytes =>
  serialize(Nep413MessageSchema, {
    tag: Nep413Message.Tag,
    message: message.data,
    recipient: message.requester,
    nonce: Uint8Array.fromBase64(message.nonce),
  });
