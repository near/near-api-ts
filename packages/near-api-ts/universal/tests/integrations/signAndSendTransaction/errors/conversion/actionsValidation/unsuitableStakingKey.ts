import { randomSecp256k1KeyPair, stake } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../utils/assertUnmappedInvalidTxError';
import type { TestContext } from './actionsValidation.test';

export const unsuitableStakingKey = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  // Validators sign blocks with ed25519 keys only, so `is_valid_staking_key` turns down
  // every other curve — the key doesn't have to belong to the account to be rejected.
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

  assertUnmappedInvalidTxError(tx, {
    ActionsValidation: {
      UnsuitableStakingKey: { publicKey: secp256k1KeyPair.publicKey },
    },
  });
};
