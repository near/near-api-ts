import * as v from 'valibot';
import { PublicKeySchema } from './publicKey';
import { Base58CryptoHashSchema } from './cryptoHash';

// Near Account
const AccountIdSchema = v.pipe(v.string(), v.brand('AccountId'));

type AccountId = v.InferOutput<typeof AccountIdSchema>;

const NonceSchema = v.number('uint64');

const TransferActionSchema = v.object({
  type: v.literal('Transfer'),
  params: v.object({
    amount: v.object({
      yoctoNear: v.bigint(),
    }),
  }),
});

const CreateAccountActionSchema = v.object({
  type: v.literal('CreateAccount'),
});

const ActionSchema = v.variant('type', [
  TransferActionSchema,
  CreateAccountActionSchema,
]);

export const TransactionSchema = v.object({
  signerAccountId: AccountIdSchema,
  signerPublicKey: PublicKeySchema,
  receiverAccountId: AccountIdSchema,
  // action: v.optional(ActionSchema),
  nonce: NonceSchema,
  blockHash: Base58CryptoHashSchema,
});


type Transaction = v.InferOutput<typeof TransactionSchema>;

// const a: Transaction = {}
