import * as z from 'zod/mini';
import type {
  CreateExecuteDelegationAction,
  SafeCreateExecuteDelegationAction,
} from '../../../types/_common/transaction/actions/executeDelegation/executeDelegation';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { SignedDelegationZodSchema } from '../_common/_common/zodSchemas/delegation';

export const CreateExecuteDelegationActionArgsSchema = z.object({
  signedDelegation: SignedDelegationZodSchema,
});

export const safeExecuteDelegation: SafeCreateExecuteDelegationAction = wrapInternalError(
  'CreateAction.ExecuteDelegation.Internal',
  (args) => {
    const validArgs = CreateExecuteDelegationActionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateAction.ExecuteDelegation.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    return result.ok({
      actionType: 'ExecuteDelegation' as const,
      delegation: args.signedDelegation.delegation,
      signature: args.signedDelegation.signature,
    });
  },
);

export const throwableExecuteDelegation: CreateExecuteDelegationAction =
  asThrowable(safeExecuteDelegation);
