import * as z from 'zod/mini';
import { base64 } from '@scure/base';
import type {
  CreateSafeSendSignedTransaction,
  SafeSendSignedTransaction,
} from '../../../../../types/client/methods/transaction/sendSignedTransaction';
import { toBorshSignedTransaction } from '../../../../_common/transformers/toBorshBytes/transaction';
import { SignedTransactionSchema } from '../../../../_common/schemas/zod/transaction/transaction';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { result } from '../../../../_common/utils/result';
import { createNatError } from '../../../../_common/natError';
import { handleError } from './handleError/handleError';
import { handleResult } from './handleResult/handleResult';
import {
  BaseOptionsSchema,
  PoliciesSchema,
} from '../../../../_common/schemas/zod/client';
import { repackError } from '@universal/src/_common/utils/repackError';

// We will return the ability to select waitUntil after redesign its name;

const SendSignedTransactionArgsShema = z.object({
  signedTransaction: SignedTransactionSchema,
  policies: PoliciesSchema,
  options: BaseOptionsSchema,
});

export const createSafeSendSignedTransaction: CreateSafeSendSignedTransaction =
  (context) =>
    wrapInternalError(
      'Client.SendSignedTransaction.Internal',
      async (args): ReturnType<SafeSendSignedTransaction> => {
        const validArgs = SendSignedTransactionArgsShema.safeParse(args);

        if (!validArgs.success)
          return result.err(
            createNatError({
              kind: 'Client.SendSignedTransaction.Args.InvalidSchema',
              context: { zodError: validArgs.error },
            }),
          );

        const rpcResponse = await context.sendRequest({
          method: 'send_tx',
          params: {
            signed_tx_base64: base64.encode(
              toBorshSignedTransaction(validArgs.data.signedTransaction),
            ),
            wait_until: 'FINAL',
          },
          transportPolicy: args.policies?.transport,
          signal: args.options?.signal,
        });

        if (!rpcResponse.ok)
          return repackError({
            error: rpcResponse.error,
            originPrefix: 'SendRequest',
            targetPrefix: 'Client.SendSignedTransaction',
          });

        return rpcResponse.value.error
          ? handleError(rpcResponse.value)
          : handleResult(rpcResponse.value, args);
      },
    );
