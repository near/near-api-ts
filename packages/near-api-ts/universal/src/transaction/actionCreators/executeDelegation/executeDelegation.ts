import { deserialize } from 'borsh';
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

      // TODO Validate here by zod?
      const wireSignedDelegation = deserialize(
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
