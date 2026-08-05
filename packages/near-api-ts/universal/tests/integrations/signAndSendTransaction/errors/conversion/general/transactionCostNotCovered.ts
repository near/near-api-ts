import { expect } from 'vitest';
import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import type { TestContext } from './general.test';

export const transactionCostNotCovered = (context: TestContext) => async () => {
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

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.TransactionCost.NotCovered');
  expect(tx.error.context.info.signerAccountId).toBe('nat');
  // The reported cost is the deposit plus the fees of the transaction.
  expect(tx.error.context.info.transactionCost.yoctoNear).toBeGreaterThan(amount);
  // The cost minus what the account held — the node compares against `account.amount()`,
  // i.e. the balance without the validator stake.
  expect(tx.error.context.info.minimalMissingAmount.yoctoNear).toBe(
    tx.error.context.info.transactionCost.yoctoNear -
      balance.total.sub(balance.locked.validatorStake).yoctoNear,
  );
};
