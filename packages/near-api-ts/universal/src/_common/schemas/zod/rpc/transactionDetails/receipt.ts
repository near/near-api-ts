import { ActionViewSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../common/accountId';
import { PublicKeyZodSchema } from '../../common/publicKey';

const DataReceiverZodSchema = z.object({
  dataId: z.string(),
  receiverId: AccountIdZodSchema,
});

export const RpcActionReceiptZodSchema = z.object({
  receiptId: z.string(),
  predecessorId: AccountIdZodSchema,
  receiverId: AccountIdZodSchema,
  receipt: z.object({
    Action: z.object({
      actions: z.array(ActionViewSchema()),
      gasPrice: z.string(),
      inputDataIds: z.array(z.string()),
      outputDataReceivers: z.array(DataReceiverZodSchema),
      isPromiseYield: z.boolean(),
      signerId: AccountIdZodSchema,
      signerPublicKey: PublicKeyZodSchema,
    }),
  }),
});

export type RpcActionReceipt = z.infer<typeof RpcActionReceiptZodSchema>;

// We don't use these fields at all; So we trim them to avoid adding unnecessary placeholders for
// manually created receipts;
export type RpcActionReceiptTrimmed = Omit<RpcActionReceipt, 'receipt'> & {
  receipt: {
    Action: Omit<
      RpcActionReceipt['receipt']['Action'],
      'gasPrice' | 'signerId' | 'signerPublicKey'
    >;
  };
};
