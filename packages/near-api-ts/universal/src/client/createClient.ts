import * as z from 'zod/mini';
import type { Client } from '../../types/client/client';
import type { CreateClient, SafeCreateClient } from '../../types/client/createClient';
import { createNatError } from '../_common/natError';
import { asThrowable } from '../_common/utils/asThrowable';
import { result } from '../_common/utils/result';
import { wrapInternalError } from '../_common/utils/wrapInternalError';
import { createCache } from './cache/createCache';
import { createSafeGetAccountAccessKey } from './methods/account/getAccountAccessKey/getAccountAccessKey';
import { createSafeGetAccountAccessKeys } from './methods/account/getAccountAccessKeys/getAccountAccessKeys';
import { createSafeGetAccountInfo } from './methods/account/getAccountInfo/getAccountInfo';
import { createSafeGetBlock } from './methods/block/getBlock/getBlock';
import { createSafeCallContractReadFunction } from './methods/contract/callContractReadFunction/callContractReadFunction';
import { createSafeSendSignedTransaction } from './methods/transaction/sendSignedTransaction/sendSignedTransaction';
import { createTransport, CreateTransportArgsSchema } from './transport/createTransport';

export const ClientBrand = Symbol('Client');

export const isClient = (value: unknown): value is Client =>
  typeof value === 'object' && value !== null && ClientBrand in value;

const CreateClientArgsSchema = z.object({
  transport: CreateTransportArgsSchema,
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
    const safeGetAccountAccessKey = createSafeGetAccountAccessKey(context);
    const safeGetAccountAccessKeys = createSafeGetAccountAccessKeys(context);
    const safeCallContractReadFunction =
      createSafeCallContractReadFunction(context);
    const safeGetBlock = createSafeGetBlock(context);
    const safeSendSignedTransaction = createSafeSendSignedTransaction(context);

    return result.ok({
      [ClientBrand]: true as const, // TODO hide from console.log
      getAccountInfo: asThrowable(safeGetAccountInfo),
      getAccountAccessKey: asThrowable(safeGetAccountAccessKey),
      getAccountAccessKeys: asThrowable(safeGetAccountAccessKeys),
      callContractReadFunction: asThrowable(
        safeCallContractReadFunction as any,
      ) as any, // TODO Fix: asThrowable doesn't work fine with overloads
      getBlock: asThrowable(safeGetBlock),
      getRecentBlockHash: asThrowable(cache.getRecentBlockHash),
      sendSignedTransaction: asThrowable(safeSendSignedTransaction),
      safeGetAccountInfo,
      safeGetAccountAccessKey,
      safeGetAccountAccessKeys,
      safeCallContractReadFunction,
      safeGetBlock,
      safeGetRecentBlockHash: cache.getRecentBlockHash,
      safeSendSignedTransaction,
    });
  },
);

export const throwableCreateClient: CreateClient =
  asThrowable(safeCreateClient);
