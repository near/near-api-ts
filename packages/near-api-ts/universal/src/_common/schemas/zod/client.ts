import * as z from 'zod/mini';
import { PartialTransportPolicyZodSchema } from '../../../client/transport/transportPolicy';
import { BlockHashZodSchema, BlockHeightZodSchema } from './common/common';

export const PoliciesZodSchema = z.optional(
  z.object({
    transport: PartialTransportPolicyZodSchema,
  }),
);

export const BaseOptionsZodSchema = z.optional(
  z.object({
    signal: z.optional(z.instanceof(AbortSignal)),
  }),
);

export const BlockReferenceZodSchema = z.union([
  z.literal('LatestOptimisticBlock'),
  z.literal('LatestNearFinalBlock'),
  z.literal('LatestFinalBlock'),
  z.literal('EarliestAvailableBlock'),
  z.literal('GenesisBlock'),
  z.object({
    blockHash: BlockHashZodSchema,
    blockHeight: z.optional(z.never()),
  }),
  z.object({
    blockHash: z.optional(z.never()),
    blockHeight: BlockHeightZodSchema,
  }),
]);
