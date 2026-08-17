import { sha256 } from '@noble/hashes/sha2.js';
import { serialize } from 'borsh';
import * as z from 'zod/mini';
import type {
  SafeSignDelegation,
  SignDelegation,
} from '../../../types/_common/transaction/signDelegation';
import { constants } from '../../_common/_common/_common/constants';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import {
  DelegationBorshSchema,
  SignedDelegationBorshSchema,
} from '../_common/borshSchemas/transaction/executeDelegation/delegation';
import { toNearcoreSignature } from '../_common/toNearcore/_common/toNearcoreSignature';
import { toNearcoreDelegation } from '../_common/toNearcore/executeDelegation/delegation';
import {
  DelegationBaseZodSchema,
  MultiDelegatedActionsZodSchema,
  SingleDelegatedActionZodSchema,
} from '../_common/zodSchemas/transaction/executeDelegation/delegation';

const SignDelegationArgsSchema = z.object({
  delegation: z.union([
    z.object({
      ...DelegationBaseZodSchema.shape,
      ...SingleDelegatedActionZodSchema.shape,
    }),
    z.object({
      ...DelegationBaseZodSchema.shape,
      ...MultiDelegatedActionsZodSchema.shape,
    }),
  ]),
  signDataProvider: z.object({
    safeSignData: z.custom(
      (val) => typeof val === 'function',
      'keyService.safeSignData must be a function',
    ),
  }),
});

export type SignDelegationArgs = z.infer<typeof SignDelegationArgsSchema>;

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
    const transactionBorshU8 = serialize(DelegationBorshSchema, nearcoreDelegation);
    const transactionHashU8 = sha256(transactionBorshU8);

    const signedData = await args.signDataProvider.safeSignData({
      publicKey: innerDelegation.signerPublicKey.publicKey,
      dataU8: transactionHashU8,
    });

    if (!signedData.ok)
      return resultNatError('SignDelegation.SignData.Failed', { cause: signedData.error });

    // #2: Serialize signed delegation into borsh
    const nearcoreSignedDelegation = {
      delegation: nearcoreDelegation,
      signature: toNearcoreSignature(signedData.value),
    };

    const signedDelegationBorshU8 = serialize(
      SignedDelegationBorshSchema,
      nearcoreSignedDelegation,
    );

    // #3: Return signed transaction
    const delegation = {
      ...args.delegation,
      tag: constants.Nep413Message.Tag,
      delegatedActions: args.delegation.delegatedAction
        ? [args.delegation.delegatedAction]
        : args.delegation.delegatedActions,
    };

    return result.ok({
      delegation,
      signature: signedData.value.signature,
      signedDelegationBorsh64: signedDelegationBorshU8.toBase64(),
    });
  },
);

export const signDelegation: SignDelegation = asThrowable(safeSignDelegation);
