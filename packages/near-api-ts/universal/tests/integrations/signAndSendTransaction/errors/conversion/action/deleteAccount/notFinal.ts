import { expect } from 'vitest';
import { deleteAccount, transfer } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../action.test';

export const notFinal = (context: TestContext) => async () => {
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
      // Nothing may follow the deletion — the account is gone by then. The check runs while
      // the actions are validated, so `nat` survives this transaction untouched.
      actions: [
        deleteAccount({ beneficiaryAccountId: 'bob' }),
        transfer({ amount: { yoctoNear: '1' } }),
      ],
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.DeleteAccount.NotFinal');
  expect(tx.error.context.info).toBe(null);
};
