import * as z from 'zod/mini';

export const TransactionProcessingStageZodSchema = z.union([
  z.literal('ConvertedOptimistic'),
  z.literal('ConvertedFinal'),
  z.literal('ExecutedOptimistic'),
  z.literal('ExecutedNearlyFinal'),
  z.literal('CompletedFinal'),
]);
