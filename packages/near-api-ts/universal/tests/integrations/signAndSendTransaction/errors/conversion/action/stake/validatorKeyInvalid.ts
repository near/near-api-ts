import { expect } from 'vitest';
import { randomSecp256k1KeyPair, stake } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../action.test';

export const validatorKeyInvalid = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  // Validators sign blocks with ed25519 keys only, so `is_valid_staking_key` turns down
  // every other curve — the key doesn't have to belong to the account to be rejected. The
  // other half of the check, an ed25519 key that doesn't convert to ristretto, needs bytes
  // that are not a torsion-free point, which `randomEd25519KeyPair` never produces.
  const secp256k1KeyPair = randomSecp256k1KeyPair();

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
      action: stake({
        amount: { near: '1' },
        validatorPublicKey: secp256k1KeyPair.publicKey,
      }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Action.Stake.ValidatorKey.Invalid');
  expect(tx.error.context.info).toStrictEqual({
    validatorPublicKey: secp256k1KeyPair.publicKey,
  });
};
