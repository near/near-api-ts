import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { executeDelegation, keyPair, signDelegation, transfer } from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import type { TestContext } from '../actions.test';

export const executeDelegationTooMany = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;
  const defaultKp = keyPair(DEFAULT_PRIVATE_KEY);

  const aliceAccessKey = await client.getAccountAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedDelegation = await signDelegation({
    delegation: {
      delegatorAccountId: 'alice',
      delegatorPublicKey: defaultKp.publicKey,
      delegatedAction: transfer({ amount: { near: '1' } }),
      receiverAccountId: 'bob',
      nonce: aliceAccessKey.accountAccessKey.nonce + 1,
      expiration: { blockHeight: aliceAccessKey.blockHeight + 100 },
    },
    signDataProvider: defaultKp,
  });

  const natAccessKey = await client.getAccountAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: natAccessKey.accountAccessKey.nonce + 1,
      blockHash: natAccessKey.blockHash,
      actions: [executeDelegation({ signedDelegation }), executeDelegation({ signedDelegation })],
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Actions.ExecuteDelegation.TooMany');
};
