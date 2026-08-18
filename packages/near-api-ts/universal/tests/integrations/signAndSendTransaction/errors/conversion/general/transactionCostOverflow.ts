import { expect } from 'vitest';
import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/transaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import type { TestContext } from './general.test';

// The largest balance that fits into u128, so adding the gas cost on top of it overflows
// while the node computes the transaction cost.
const MAX_YOCTO_NEAR = 2n ** 128n - 1n;

export const transactionCostOverflow = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      action: transfer({ amount: { yoctoNear: MAX_YOCTO_NEAR } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.TransactionCost.Overflow');
  expect(tx.error.context.info).toBe(null);
};
