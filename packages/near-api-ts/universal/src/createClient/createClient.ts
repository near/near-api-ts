import * as z from 'zod/mini';
import type { Client } from '../../types/client/client';
import type { CreateClient, SafeCreateClient } from '../../types/client/createClient';
import { createNatError } from '../_common/_common/_common/_common/natError';
import { result } from '../_common/_common/_common/result';
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

const CreateClientArgsSchema = z.object({
  transport: CreateTransportArgsZodSchema,
});

export const safeCreateClient: SafeCreateClient = wrapInternalError(
  'CreateClient.Internal',
  (args) => {
    const validArgs = CreateClientArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateClient.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const transport = createTransport(args.transport);
    const cache = createCache({ transport });

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
