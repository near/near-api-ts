import { expect } from 'vitest';
import { randomEd25519KeyPair, transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/createMemorySignService/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import type { TestContext } from './signer.test';

const SIGNER_ACCOUNT_ID = 'ghost.nat';

export const notFound = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  // The account was never created, so the node has neither an account record nor an access
  // key to look up — the signature itself is valid for the key stated in the transaction.
  const signerKeyPair = randomEd25519KeyPair();

  const { blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: signerKeyPair,
    transaction: {
      signerAccountId: SIGNER_ACCOUNT_ID,
      signerPublicKey: signerKeyPair.publicKey,
      nonce: 1,
      blockHash,
      action: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Signer.NotFound');
  expect(tx.error.context.info).toStrictEqual({ signerAccountId: SIGNER_ACCOUNT_ID });
};
