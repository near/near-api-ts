import { transfer } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../utils/assertUnmappedInvalidTxError';
import type { TestContext } from './actionsValidation.test';

// `max_actions_per_receipt` from the runtime config — never changed since genesis.
const MAX_ACTIONS_PER_RECEIPT = 100;

export const totalNumberOfActionsExceeded = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  // The action count is the first thing `validate_actions_with_mode` looks at, so the
  // cheapest action repeated once over the limit is enough — none of them is validated.
  const totalNumberOfActions = MAX_ACTIONS_PER_RECEIPT + 1;

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
      actions: Array.from({ length: totalNumberOfActions }, () =>
        transfer({ amount: { yoctoNear: '1' } }),
      ),
      receiverAccountId: 'bob',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertUnmappedInvalidTxError(tx, {
    ActionsValidation: {
      TotalNumberOfActionsExceeded: {
        limit: MAX_ACTIONS_PER_RECEIPT,
        totalNumberOfActions,
      },
    },
  });
};
