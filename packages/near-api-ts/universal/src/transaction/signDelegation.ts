import { sha256 } from '@noble/hashes/sha2.js';
import { serialize } from 'borsh';
import * as z from 'zod/mini';
import type { NearcoreSignedDelegationV2 } from '../../types/_common/transaction/actions/executeDelegation/delegation';
import type {
  SafeSignDelegation,
  SignDelegation,
} from '../../types/_common/transaction/signDelegation';
import { constants } from '../_common/_common/_common/constants';
import { result, resultNatError } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import {
  DelegationV2BorshSchema,
  SignedDelegationV2BorshSchema,
} from './_common/delegationBorshSchema';
import { DelegationZodSchema } from './_common/delegationZodSchema';
import { toNearcoreDelegationV2 } from './_common/toNearcoreDelegation';
import { toNearcoreSignature } from './_common/toNearcoreSignature';

const SignDelegationArgsSchema = z.object({
  delegation: DelegationZodSchema,
  signDataProvider: z.object({
    safeSignData: z.custom(
      (val) => typeof val === 'function',
      'signDataProvider.safeSignData must be a function',
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

    // Always NEP-611 (nearcore `DelegateActionV2`): unlike the NEP-366 format, it can use any
    // nonce channel of the delegator's key.
    const nearcoreDelegation = toNearcoreDelegationV2(innerDelegation);
    // The signed bytes are the tagged message, not the delegation itself
    const delegationBorshU8 = serialize(DelegationV2BorshSchema, nearcoreDelegation);
    const delegationHashU8 = sha256(delegationBorshU8);

    const signedData = await args.signDataProvider.safeSignData({
      publicKey: innerDelegation.delegator.publicKey.publicKey,
      dataU8: delegationHashU8,
    });

    if (!signedData.success)
      return resultNatError('SignDelegation.SignData.Failed', { cause: signedData.error });

    // #2: Serialize signed delegation into borsh
    const nearcoreSignedDelegation: NearcoreSignedDelegationV2 = {
      delegation: nearcoreDelegation,
      signature: toNearcoreSignature(signedData.data),
    };

    const signedDelegationBorshU8 = serialize(
      SignedDelegationV2BorshSchema,
      nearcoreSignedDelegation,
    );

    // #3: Return signed delegation. The single-action shorthand is normalized into
    // the action list, so a relayer always gets the same shape back.
    const { delegatedAction, delegatedActions, ...delegationBase } = args.delegation;

    return result.ok({
      signedDelegation: {
        delegation: {
          tag: constants.Delegation.Nep611Tag,
          ...delegationBase,
          delegatedActions: delegatedAction ? [delegatedAction] : delegatedActions,
        },
        signature: signedData.data.signature,
      },
      signedDelegationBorsh64: signedDelegationBorshU8.toBase64(),
    });
  },
);

export const signDelegation: SignDelegation = asThrowable(safeSignDelegation);
