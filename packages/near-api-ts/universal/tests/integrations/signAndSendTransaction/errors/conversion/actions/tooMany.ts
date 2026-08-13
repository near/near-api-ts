import { expect } from 'vitest';
import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/createMemorySignService/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import type { TestContext } from './actions.test';

// `max_actions_per_receipt` from the runtime config — never changed since genesis.
const MAX_ACTIONS_PER_RECEIPT = 100;

export const tooMany = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  // The action count is the first thing `validate_actions_with_mode` looks at, so the
  // cheapest action repeated once over the limit is enough — none of them is validated.
  const actionsCount = MAX_ACTIONS_PER_RECEIPT + 1;

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
      actions: Array.from({ length: actionsCount }, () => transfer({ amount: { yoctoNear: '1' } })),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Actions.TooMany');
  expect(tx.error.context.info).toStrictEqual({
    actionsCount,
    maximumActionsCount: MAX_ACTIONS_PER_RECEIPT,
  });
};
