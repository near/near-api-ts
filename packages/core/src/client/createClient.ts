import * as z from 'zod/mini';
import { createSafeGetAccountInfo } from './methods/account/getAccountInfo/getAccountInfo';
import { createSafeGetAccountAccessKey } from './methods/account/getAccountAccessKey/getAccountAccessKey';
import { createSafeGetAccountAccessKeys } from './methods/account/getAccountAccessKeys/getAccountAccessKeys';

import { createSafeSendSignedTransaction } from './methods/transaction/sendSignedTransaction/sendSignedTransaction';
import {
  createTransport,
  CreateTransportArgsSchema,
} from './transport/createTransport';
import type {
  CreateClient,
  SafeCreateClient,
} from 'nat-types/client/createClient';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import { result } from '@common/utils/result';
import { asThrowable } from '@common/utils/asThrowable';
import { createNatError } from '@common/natError';

// NextFeature: add cache for protocol config / blockHash

const CreateClientArgsSchema = z.object({
  transport: CreateTransportArgsSchema,
});

export const safeCreateClient: SafeCreateClient = wrapUnknownError(
  'CreateClient.Unknown',
  async (args) => {
    const validArgs = CreateClientArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateClient.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const transport = createTransport(args.transport);

    const context = {
      sendRequest: transport.sendRequest,
    };

    const safeGetAccountInfo = createSafeGetAccountInfo(context);
    const safeGetAccountAccessKey = createSafeGetAccountAccessKey(context);
    const safeGetAccountAccessKeys = createSafeGetAccountAccessKeys(context);
    const safeSendSignedTransaction = createSafeSendSignedTransaction(context);

    return result.ok({
      getAccountInfo: asThrowable(safeGetAccountInfo),
      getAccountAccessKey: asThrowable(safeGetAccountAccessKey),
      getAccountAccessKeys: asThrowable(safeGetAccountAccessKeys),
      sendSignedTransaction: asThrowable(safeSendSignedTransaction),
      safeGetAccountInfo,
      safeGetAccountAccessKey,
      safeGetAccountAccessKeys,
      safeSendSignedTransaction,
    });
  },
);

export const throwableCreateClient: CreateClient =
  asThrowable(safeCreateClient);
