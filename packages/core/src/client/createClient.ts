import * as z from 'zod/mini';
import { createGetAccountInfo } from './methods/account/getAccountInfo';
import { createGetAccountKey } from './methods/account/getAccountKey';
import { createGetAccountKeys } from './methods/account/getAccountKeys';
import { createGetContractState } from './methods/contract/getContractState';
import { createCallContractReadFunction } from './methods/contract/callContractReadFunction';
import { createGetBlock } from './methods/block/getBlock';
import { createGetGasPrice } from './methods/protocol/getGasPrice';
import { createGetProtocolConfig } from './methods/protocol/getProtocolConfig';
import { createSendSignedTransaction } from './methods/transaction/sendSignedTransaction';
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
          kind: 'CreateClient.InvalidArgs',
          context: { zodError: validArgs.error },
        }),
      );

    const transport = createTransport(args.transport);

    const context = {
      sendRequest: transport.sendRequest,
    };

    return result.ok({
      getAccountInfo: createGetAccountInfo(context),
      // getAccountKey: createGetAccountKey(context),
      // getAccountKeys: createGetAccountKeys(context),
      // getContractState: createGetContractState(context),
      // callContractReadFunction: createCallContractReadFunction(context),
      // getBlock: createGetBlock(context),
      // getGasPrice: createGetGasPrice(context),
      // getProtocolConfig: createGetProtocolConfig(context),
      // sendSignedTransaction: createSendSignedTransaction(context),
    });
  },
);

export const throwableCreateClient: CreateClient =
  asThrowable(safeCreateClient);
