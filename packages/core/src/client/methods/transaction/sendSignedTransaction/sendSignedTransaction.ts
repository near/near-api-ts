import * as z from 'zod/mini';
import { base64 } from '@scure/base';
import type { CreateSafeSendSignedTransaction } from 'nat-types/client/methods/transaction/sendSignedTransaction';
import { toBorshSignedTransaction } from '@common/transformers/toBorshBytes/transaction';
import { SignedTransactionSchema } from '@common/schemas/zod/transaction/transaction';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import { repackError } from '@common/utils/repackError';
import { handleError } from './handleError/handleError';
import { handleResult } from './handleResult/handleResult';
import { BaseOptionsSchema, PoliciesSchema } from '@common/schemas/zod/client';

// We will return the ability to select waitUntil after redesign its name;

const SendSignedTransactionArgsShema = z.object({
  signedTransaction: SignedTransactionSchema,
  policies: PoliciesSchema,
  options: BaseOptionsSchema,
});

export const createSafeSendSignedTransaction: CreateSafeSendSignedTransaction =
  (context) =>
    wrapUnknownError('Client.SendSignedTransaction.Unknown', async (args) => {
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
          wait_until: 'EXECUTED_OPTIMISTIC',
        },
        transportPolicy: args.policies?.transport,
        signal: args.options?.signal,
      });

      if (!rpcResponse.ok)
        return repackError({
          error: rpcResponse.error,
          originPrefix: 'Client.Transport.SendRequest',
          targetPrefix: 'Client.SendSignedTransaction',
        });

      return rpcResponse.value.error
        ? handleError(rpcResponse.value)
        : handleResult(rpcResponse.value, args);
    });
