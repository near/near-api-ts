import { expect } from 'vitest';
import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/createMemorySignService/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import type { TestContext } from './general.test';

// A well-formed hash of a block the chain has never seen.
const UNKNOWN_BLOCK_HASH = '11111111111111111111111111111112';

export const blockHashExpired = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      // `check_transaction_validity_period` (`chain/chain/src/store/utils.rs`) looks the block
      // up first and answers `Expired` when it isn't in the store — the same error a block
      // hash older than `transaction_validity_period` (100 blocks) gets from the next check,
      // only without waiting for the chain to grow past it.
      blockHash: UNKNOWN_BLOCK_HASH,
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.BlockHash.Expired');
  expect(tx.error.context.info).toBe(null);
};
