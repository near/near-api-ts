import * as z from 'zod/mini';
import { base64 } from '@scure/base';
import { RpcTransactionResponseSchema } from '@near-js/jsonrpc-types';
import type {
  CreateSendSignedTransaction,
  SendSignedTransactionResult,
} from 'nat-types/client/methods/transaction/sendSignedTransaction';
import { toBorshSignedTransaction } from '@common/transformers/toBorshBytes/transaction';
import { SignedTransactionSchema } from '@common/schemas/zod/transaction/transaction';

const transformResult = (result: unknown): SendSignedTransactionResult => {
  return RpcTransactionResponseSchema().parse(result);
};

const SendSignedTransactionArgsShema = z.object({
  signedTransaction: SignedTransactionSchema,
});

// We will return the ability to select waitUntil after redesign its name;

export const createSendSignedTransaction: CreateSendSignedTransaction =
  ({ sendRequest }) =>
  async (args) => {
    // TODO to safe format
    const validArgs = SendSignedTransactionArgsShema.parse(args);

    const result = await sendRequest({
      method: 'send_tx',
      params: {
        signed_tx_base64: base64.encode(
          toBorshSignedTransaction(validArgs.signedTransaction),
        ),
        wait_until: 'EXECUTED_OPTIMISTIC',
      },
      transportPolicy: args.policies?.transport,
      signal: args.options?.signal,
    });

    return transformResult(result);
  };
