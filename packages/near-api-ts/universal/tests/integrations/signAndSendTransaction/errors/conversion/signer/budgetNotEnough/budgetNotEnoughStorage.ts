import { expect } from 'vitest';
import {
  addFullAccessKey,
  addFunctionCallKey,
  createAccount,
  randomEd25519KeyPair,
  transfer,
} from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../signer.test';

// `ZERO_BALANCE_ACCOUNT_STORAGE_LIMIT` from `runtime/runtime/src/verifier.rs` — an account
// that fits into it is a zero balance account and never pays for its storage, which is why
// the genesis accounts (182 bytes) can be drained to the last yoctoNEAR.
const ZERO_BALANCE_ACCOUNT_STORAGE_LIMIT = 770;

// Every function-call key with a 64 character contract account id adds ~170 bytes, so a
// handful of them is enough to leave the zero balance range.
const EXTRA_KEYS_COUNT = 5;

const ACCOUNT_ID = 'storage.nat';

export const budgetNotEnoughStorage = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const accountKeyPair = randomEd25519KeyPair();

  const natAccessKey = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const createAccountTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: natAccessKey.accountAccessKey.nonce + 1,
      blockHash: natAccessKey.blockHash,
      actions: [
        createAccount(),
        transfer({ amount: { near: '1' } }),
        addFullAccessKey({ publicKey: accountKeyPair.publicKey }),
      ],
      receiverAccountId: ACCOUNT_ID,
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: createAccountTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  const accountAccessKey = await client.getAccountAccessKey({
    accountId: ACCOUNT_ID,
    publicKey: accountKeyPair.publicKey,
  });

  const addKeysTransaction = await signTransaction({
    signDataProvider: accountKeyPair,
    transaction: {
      signerAccountId: ACCOUNT_ID,
      signerPublicKey: accountKeyPair.publicKey,
      nonce: accountAccessKey.accountAccessKey.nonce + 1,
      blockHash: accountAccessKey.blockHash,
      actions: Array.from({ length: EXTRA_KEYS_COUNT }, () =>
        addFunctionCallKey({
          publicKey: randomEd25519KeyPair().publicKey,
          contractAccountId: 'a'.repeat(64),
          gasBudget: 'Unlimited',
          allowedFunctions: 'AllNonPayable',
        }),
      ),
      receiverAccountId: ACCOUNT_ID,
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: addKeysTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  const { balance, usedStorageBytes } = await client.getAccountInfo({ accountId: ACCOUNT_ID });
  expect(usedStorageBytes).toBeGreaterThan(ZERO_BALANCE_ACCOUNT_STORAGE_LIMIT);

  const { blockHash } = natAccessKey;
  const drainAccountTransaction = await signTransaction({
    signDataProvider: accountKeyPair,
    transaction: {
      signerAccountId: ACCOUNT_ID,
      signerPublicKey: accountKeyPair.publicKey,
      nonce: accountAccessKey.accountAccessKey.nonce + 2,
      blockHash,
      // `available` is everything but the storage deposit, so sending it away leaves the
      // account exactly at the required amount — and the transaction cost is charged on top
      // of it, which is what `check_storage_stake` reports as missing.
      action: transfer({ amount: { yoctoNear: balance.available.yoctoNear } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction: drainAccountTransaction,
  });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.Budget.NotEnough');
  expect(tx.error.context.info.signerAccountId).toBe(ACCOUNT_ID);
  // The missing amount is the transaction cost, which depends on the current gas price.
  expect(tx.error.context.info.minimalMissingAmount.yoctoNear).toBeGreaterThan(0n);
};
