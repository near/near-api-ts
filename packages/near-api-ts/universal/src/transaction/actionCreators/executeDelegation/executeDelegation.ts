import { deserialize, type Schema, serialize } from 'borsh';
import * as z from 'zod/mini';
import type {
  CreateExecuteDelegationAction,
  SafeCreateExecuteDelegationAction,
} from '../../../../types/_common/transaction/actions/executeDelegation/executeDelegation';
import { result, resultNatError } from '../../../_common/_common/_common/result';
import { asThrowable } from '../../../_common/_common/asThrowable';
import { wrapInternalError } from '../../../_common/_common/wrapInternalError';
import { SignedDelegationBorshSchema } from '../../_common/delegationBorshSchema';
import { SignedDelegationZodSchema } from '../../_common/delegationZodSchema';
import {
  fromNearcoreSignedDelegation,
  type WireSignedDelegation,
} from './fromNearcoreSignedDelegation/fromNearcoreSignedDelegation';

// What nearcore's `try_from_slice` does. borsh-js reads only the bytes the schema asks for and
// ignores the rest, while nearcore rejects bytes left over. Encoding the result back must give
// exactly the bytes that came in - this also rejects a field borsh-js reads more leniently than
// nearcore, such as a string that is not valid UTF-8.
const deserializeStrictly = (schema: Schema, bytesU8: Uint8Array) => {
  const value = deserialize(schema, bytesU8);
  const reencodedU8 = serialize(schema, value);
  const leftoverByteCount = bytesU8.length - reencodedU8.length;

  if (leftoverByteCount > 0)
    throw new Error(`Bytes left over after the borsh value: ${leftoverByteCount}`);

  if (reencodedU8.some((byte, index) => byte !== bytesU8[index]))
    throw new Error('The bytes are not encoded the way borsh encodes the value they decode to');

  return value;
};

export const CreateExecuteDelegationActionArgsSchema = z.object({
  signedDelegationBorsh64: z.base64(),
});

export const safeExecuteDelegation: SafeCreateExecuteDelegationAction = wrapInternalError(
  'CreateAction.ExecuteDelegation.Internal',
  (args) => {
    const validArgs = CreateExecuteDelegationActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateAction.ExecuteDelegation.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    try {
      const signedDelegationBorshU8 = Uint8Array.fromBase64(validArgs.data.signedDelegationBorsh64);

      const wireSignedDelegation = deserializeStrictly(
        SignedDelegationBorshSchema,
        signedDelegationBorshU8,
      ) as WireSignedDelegation;

      const signedDelegation = fromNearcoreSignedDelegation(wireSignedDelegation);

      // Borsh only proves the bytes match the schema - it says nothing about account ids,
      // key formats or number ranges. Validate here so a delegation built elsewhere is
      // rejected by the helper that received it, not later by `signTransaction`, which
      // would blame the relayer's own transaction. The parse is a gate only: it
      // transforms keys and signatures into the inner form, while the action carries
      // the public one, and `signTransaction` parses the transaction on its own anyway.
      const validSignedDelegation = SignedDelegationZodSchema.safeParse(signedDelegation);

      if (!validSignedDelegation.success)
        return resultNatError('CreateAction.ExecuteDelegation.SignedDelegation.InvalidSchema', {
          zodError: validSignedDelegation.error,
        });

      return result.ok({
        actionType: 'ExecuteDelegation' as const,
        signedDelegation,
      });
    } catch (cause) {
      return resultNatError('CreateAction.ExecuteDelegation.SignedDelegation.Deserialize.Failed', {
        cause,
      });
    }
  },
);

export const executeDelegation: CreateExecuteDelegationAction = asThrowable(safeExecuteDelegation);
