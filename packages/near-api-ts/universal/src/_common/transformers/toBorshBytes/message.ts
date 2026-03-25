import { serialize } from 'borsh';
import type { BorshBytes } from '../../../../types/_common/common';
import type { Message } from '../../../../types/_common/message';
import { Nep413Message } from '../../configs/constants';
import { Nep413MessageSchema } from '../../schemas/borsh/nep413Message';

export const toBorshNep413Message = (message: Message): BorshBytes =>
  serialize(Nep413MessageSchema, {
    tag: Nep413Message.Tag,
    message: message.message,
    recipient: message.recipient,
    nonce: Uint8Array.fromBase64(message.nonce),
  });
