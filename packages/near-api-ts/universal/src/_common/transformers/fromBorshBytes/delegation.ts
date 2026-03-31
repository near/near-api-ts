import { deserialize } from 'borsh';
import { DelegateActionActionBorshSchema } from '../../schemas/borsh/actions/delegate';

export const fromBorshDelegateActionAction = (borshBytes: Uint8Array) =>
  deserialize(DelegateActionActionBorshSchema, borshBytes);
