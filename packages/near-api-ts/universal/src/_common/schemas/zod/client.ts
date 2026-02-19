import * as z from 'zod/mini';
import { PartialTransportPolicySchema } from '../../../client/transport/transportPolicy';
import { BlockHashSchema, BlockHeightSchema } from './common/common';

export const PoliciesSchema = z.optional(
  z.object({
    transport: PartialTransportPolicySchema,
  }),
);

export const BaseOptionsSchema = z.optional(
  z.object({
    signal: z.optional(z.instanceof(AbortSignal)),
  }),
);

export const BlockReferenceSchema = z.union([
  z.literal('LatestOptimisticBlock'),
  z.literal('LatestNearFinalBlock'),
  z.literal('LatestFinalBlock'),
  z.literal('EarliestAvailableBlock'),
  z.literal('GenesisBlock'),
  z.object({
    blockHash: BlockHashSchema,
    blockHeight: z.optional(z.never()),
  }),
  z.object({
    blockHash: z.optional(z.never()),
    blockHeight: BlockHeightSchema,
  }),
]);
