import { deserialize } from 'borsh';
import { test } from 'vitest';
import { DelegateActionActionBorshSchema } from '../../src/_common/schemas/borsh/actions/delegate';
import { log } from '../utils/common';

const signedDelegate =
  'EQAAAGxhbnRzdG9vbC50ZXN0bmV0BwAAAHRlc3RuZXQBAAAAAwAAQLK6yeAZHgIAAAAAAADvM8QgPK4AADWRew4AAAAAAM3/LQEMhP7z58vctu0n8791btEMx/ttkKaDcSLQIVmfAGN4PNicjZEJD+P9CI7EWw8Ucl5TZdbYE9B+HvBZlqykWSdKjDiZ5XC7NsvEpG4GI1kRHfC3qBYu3mx/EvUkXgk=';

test('test', () => {
  const data = Uint8Array.fromBase64(signedDelegate);
  const res = deserialize(DelegateActionActionBorshSchema, data);
  log(res);
});
