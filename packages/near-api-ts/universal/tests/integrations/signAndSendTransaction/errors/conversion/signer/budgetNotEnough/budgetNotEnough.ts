import { expect } from 'vitest';
import { transfer } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../signer.test';

export const budgetNotEnough = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const { balance } = await client.getAccountInfo({ accountId: 'nat' });
  // Everything the account holds plus one NEAR — the cost still fits u128, so the node
  // reports the plain shortage instead of `TransactionCost.Overflow`.
  const amount = balance.total.yoctoNear + 10n ** 24n;

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
      action: transfer({ amount: { yoctoNear: amount } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.Budget.NotEnough');
  expect(tx.error.context.info.signerAccountId).toBe('nat');
  // `minimalMissingAmount` is the transaction cost (the attempted deposit plus fees) minus what
  // the account can spend — the node compares against `account.amount()`, i.e. the balance
  // without the validator stake. The attempted deposit alone already exceeds that by 1 NEAR.
  expect(tx.error.context.info.minimalMissingAmount.yoctoNear).toBeGreaterThanOrEqual(10n ** 24n);
};
