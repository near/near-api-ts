import * as z from 'zod/mini';
import type { Client } from '../../types/client/client';
import type { CreateClient, SafeCreateClient } from '../../types/client/createClient';

import { result, resultNatError } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { createCache } from './createCache/createCache';
import { CreateTransportArgsZodSchema, createTransport } from './createTransport/createTransport';
import { createSafeGetAccessKey } from './methods/account/getAccessKey/getAccessKey';
import { createSafeGetAccessKeyNonceChannels } from './methods/account/getAccessKeyNonceChannels/getAccessKeyNonceChannels';
import { createSafeGetAccessKeys } from './methods/account/getAccessKeys/getAccessKeys';
import { createSafeGetAccountInfo } from './methods/account/getAccountInfo/getAccountInfo';
import { createSafeGetBlock } from './methods/block/getBlock/getBlock';
import { createSafeCallContractReadFunction } from './methods/contract/callContractReadFunction/callContractReadFunction';
import { createSafeGetTransactionResult } from './methods/transaction/getTransactionResult/getTransactionResult';
import { createSafeSendSignedTransaction } from './methods/transaction/sendSignedTransaction/sendSignedTransaction';

const CreateClientArgsZodSchema = z.object({
  transport: CreateTransportArgsZodSchema,
  cache: z.optional(
    z.object({
      recentBlockHash: z.optional(
        z.object({
          ttlMs: z.optional(z.number().check(z.nonnegative())),
        }),
      ),
    }),
  ),
});

export const safeCreateClient: SafeCreateClient = wrapInternalError(
  'CreateClient.Internal',
  (args) => {
    const validArgs = CreateClientArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateClient.Args.InvalidSchema', { zodError: validArgs.error });

    const transport = createTransport(args.transport);
    const cache = createCache({ transport, options: args.cache });

    const context = {
      sendRequest: transport.sendRequest,
      cache,
    };

    const safeGetAccountInfo = createSafeGetAccountInfo(context);
    const safeGetAccessKey = createSafeGetAccessKey(context);
    const safeGetAccessKeys = createSafeGetAccessKeys(context);
    const safeGetAccessKeyNonceChannels = createSafeGetAccessKeyNonceChannels(context);
    const safeCallContractReadFunction = createSafeCallContractReadFunction(context);
    const safeGetBlock = createSafeGetBlock(context);
    const safeGetTransactionResult = createSafeGetTransactionResult(context);
    const safeSendSignedTransaction = createSafeSendSignedTransaction(context);

    return result.ok({
      getAccountInfo: asThrowable(safeGetAccountInfo),
      getAccessKey: asThrowable(safeGetAccessKey),
      getAccessKeys: asThrowable(safeGetAccessKeys),
      getAccessKeyNonceChannels: asThrowable(safeGetAccessKeyNonceChannels),
      callContractReadFunction: asThrowable(safeCallContractReadFunction as any) as any, // TODO Fix: asThrowable doesn't work fine with overloads
      getBlock: asThrowable(safeGetBlock),
      getRecentBlockHash: asThrowable(cache.getRecentBlockHash),
      getTransactionResult: asThrowable(safeGetTransactionResult),
      sendSignedTransaction: asThrowable(safeSendSignedTransaction),
      safeGetAccountInfo,
      safeGetAccessKey,
      safeGetAccessKeys,
      safeGetAccessKeyNonceChannels,
      safeCallContractReadFunction,
      safeGetBlock,
      safeGetRecentBlockHash: cache.getRecentBlockHash,
      safeGetTransactionResult,
      safeSendSignedTransaction,
    });
  },
);

export const createClient: CreateClient = asThrowable(safeCreateClient);
