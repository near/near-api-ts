import { sha256 } from '@noble/hashes/sha2.js';
import { serialize } from 'borsh';
import * as z from 'zod/mini';
import type { NearcoreSignedDelegation } from '../../types/_common/transaction/actions/executeDelegation/delegation';
import type {
  SafeSignDelegation,
  SignDelegation,
} from '../../types/_common/transaction/signDelegation';
import { constants } from '../_common/_common/_common/constants';
import { result, resultNatError } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import {
  DelegationBorshSchema,
  SignedDelegationBorshSchema,
} from './_common/borshSchemas/delegation';
import { toNearcoreDelegation } from './_common/toNearcore/toNearcoreDelegation';
import { toNearcoreSignature } from './_common/toNearcore/toNearcoreSignature';
import { DelegationZodSchema } from './_common/zodSchemas/delegation';

const SignDelegationArgsSchema = z.object({
  delegation: DelegationZodSchema,
  signDataProvider: z.object({
    safeSignData: z.custom(
      (val) => typeof val === 'function',
      'keyService.safeSignData must be a function',
    ),
  }),
});

export const safeSignDelegation: SafeSignDelegation = wrapInternalError(
  'SignDelegation.Internal',
  async (args) => {
    const validArgs = SignDelegationArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('SignDelegation.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    // #1: Sign delegation
    const { delegation: innerDelegation } = validArgs.data;

    const nearcoreDelegation = toNearcoreDelegation(innerDelegation);
    // The signed bytes are the tagged message, not the delegation itself
    const delegationBorshU8 = serialize(DelegationBorshSchema, nearcoreDelegation);
    const delegationHashU8 = sha256(delegationBorshU8);

    const signedData = await args.signDataProvider.safeSignData({
      publicKey: innerDelegation.delegatorPublicKey.publicKey,
      dataU8: delegationHashU8,
    });

    if (!signedData.ok)
      return resultNatError('SignDelegation.SignData.Failed', { cause: signedData.error });

    // #2: Serialize signed delegation into borsh
    const nearcoreSignedDelegation: NearcoreSignedDelegation = {
      delegation: nearcoreDelegation,
      signature: toNearcoreSignature(signedData.value),
    };

    const signedDelegationBorshU8 = serialize(
      SignedDelegationBorshSchema,
      nearcoreSignedDelegation,
    );

    // #3: Return signed delegation. The single-action shorthand is normalized into
    // the action list, so a relayer always gets the same shape back.
    const { delegatedAction, delegatedActions, ...delegationBase } = args.delegation;

    return result.ok({
      delegation: {
        tag: constants.Nep366MetaTransaction.Tag,
        ...delegationBase,
        delegatedActions: delegatedAction ? [delegatedAction] : delegatedActions,
      },
      signature: signedData.value.signature,
      signedDelegationBorsh64: signedDelegationBorshU8.toBase64(),
    });
  },
);

export const signDelegation: SignDelegation = asThrowable(safeSignDelegation);
