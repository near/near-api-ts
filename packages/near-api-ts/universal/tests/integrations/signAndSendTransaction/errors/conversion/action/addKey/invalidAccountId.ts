import { addFunctionCallKey, randomEd25519KeyPair } from '../../../../../../../index';
import type { InnerTransaction } from '../../../../../../../src/createMemorySignService/_common/zodSchemas/transaction/transaction';
import { assertUnmappedInvalidTxError } from '../../../../../../utils/assertUnmappedInvalidTxError';
import { signInvalidTransaction } from '../_common/signInvalidTransaction';
import type { TestContext } from '../action.test';

// Uppercase letters are not allowed in an account id, so `AccountId::validate` turns this down.
const INVALID_CONTRACT_ACCOUNT_ID = 'Alice';

/**
 * Registered as skipped (see `action.test.ts`): the node answers with the variant — this case
 * passes when it runs — but nothing assembled through the action creators can reach it, so
 * `ActionsValidationError::InvalidAccountId` is the one per-action variant that stays unmapped
 * while the actions the library builds can still reach it.
 *
 * The only field that can carry a malformed account id into the runtime is the `receiver_id` of
 * a FunctionCall access key permission, and it is the sole account id in the whole action set
 * typed as a raw `String` (`core/primitives-core/src/account.rs`, where the comment blames
 * testnet genesis records that hold invalid values). Reaching it takes bypassing
 * `AccountIdZodSchema`, which is what this case does.
 *
 * The other two sites of the variant — `beneficiary_id` of a DeleteAccount action and a global
 * contract identifier, both through `validate_action_account_id`
 * (`runtime/runtime/src/action_validation.rs`) — take an `AccountId`, whose `BorshDeserialize`
 * validates on the way in (`near-account-id`). A transaction carrying one never deserializes:
 * the node answers `-32700 Parse error` before any action is validated. Those checks exist for
 * the receipt path, where `validate_actions_with_mode` also runs with
 * `ValidateReceiptMode::ExistingReceipt` over receipts that predate the current rules.
 */
export const invalidAccountId = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signInvalidTransaction(
    defaultKeyPair,
    {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      action: addFunctionCallKey({
        publicKey: randomEd25519KeyPair().publicKey,
        contractAccountId: 'alice',
        gasBudget: 'Unlimited',
        allowedFunctions: ['ping'],
      }),
      receiverAccountId: 'nat',
    },
    (transaction) =>
      ({
        ...transaction,
        action: { ...transaction.action, contractAccountId: INVALID_CONTRACT_ACCOUNT_ID },
      }) as InnerTransaction,
  );

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertUnmappedInvalidTxError(tx, {
    ActionsValidation: { InvalidAccountId: { accountId: INVALID_CONTRACT_ACCOUNT_ID } },
  });
};
