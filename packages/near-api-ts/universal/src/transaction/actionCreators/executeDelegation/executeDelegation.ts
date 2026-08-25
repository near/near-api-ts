import { deserialize } from 'borsh';
import * as z from 'zod/mini';
import type {
  CreateExecuteDelegationAction,
  SafeCreateExecuteDelegationAction,
} from '../../../../types/_common/transaction/actions/executeDelegation/executeDelegation';
import { result, resultNatError } from '../../../_common/_common/_common/result';
import { asThrowable } from '../../../_common/_common/asThrowable';
import { wrapInternalError } from '../../../_common/_common/wrapInternalError';
import { SignedDelegationBorshSchema } from '../../_common/borshSchemas/delegation';
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

      const wireSignedDelegation = deserialize(
        SignedDelegationBorshSchema,
        signedDelegationBorshU8,
      ) as WireSignedDelegation;

      return result.ok({
        actionType: 'ExecuteDelegation' as const,
        signedDelegation: fromNearcoreSignedDelegation(wireSignedDelegation),
      });
    } catch (cause) {
      return resultNatError('CreateAction.ExecuteDelegation.Deserialize.Failed', { cause });
    }
  },
);

export const throwableExecuteDelegation: CreateExecuteDelegationAction =
  asThrowable(safeExecuteDelegation);
