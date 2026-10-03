import { expect } from 'vitest';
import {
  addAccessKey,
  createAccount,
  randomEd25519KeyPair,
  transfer,
} from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
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

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const createAccountTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(natAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      actions: [
        createAccount(),
        transfer({ amount: { near: '1' } }),
        addAccessKey({
          publicKey: accountKeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
      ],
      receiverAccountId: ACCOUNT_ID,
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: createAccountTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  const accountAccessKey = await client.getAccessKey({
    accountId: ACCOUNT_ID,
    publicKey: accountKeyPair.publicKey,
  });

  const addKeysTransaction = await signTransaction({
    signDataProvider: accountKeyPair,
    transaction: {
      signer: {
        accountId: ACCOUNT_ID,
        publicKey: accountKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(accountAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: accountAccessKey.atMomentOf.blockHash,
      actions: Array.from({ length: EXTRA_KEYS_COUNT }, () =>
        addAccessKey({
          publicKey: randomEd25519KeyPair().publicKey,
          permission: {
            kind: 'FunctionCall',
            allowedContract: 'a'.repeat(64),
            allowedFunctions: 'AllNonPayable',
          },
          gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
        }),
      ),
      receiverAccountId: ACCOUNT_ID,
    },
  });

  await client.sendSignedTransaction({
    signedTransaction: addKeysTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  const { balance, storage } = await client.getAccountInfo({ accountId: ACCOUNT_ID });
  expect(storage.usedBytes).toBeGreaterThan(ZERO_BALANCE_ACCOUNT_STORAGE_LIMIT);

  const {
    atMomentOf: { blockHash },
  } = natAccessKey;
  const drainAccountTransaction = await signTransaction({
    signDataProvider: accountKeyPair,
    transaction: {
      signer: {
        accountId: ACCOUNT_ID,
        publicKey: accountKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(accountAccessKey.accessKey) + 2,
        },
      },
      recentBlockHash: blockHash,
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
