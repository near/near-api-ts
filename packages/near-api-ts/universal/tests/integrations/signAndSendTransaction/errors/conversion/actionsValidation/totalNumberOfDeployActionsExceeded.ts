import { deployContract } from '../../../../../../index';
import { signTransaction } from '../../../../../../src/helpers/signTransaction';
import { assertUnmappedInvalidTxError } from '../../../../../utils/assertUnmappedInvalidTxError';
import type { TestContext } from './actionsValidation.test';

// `max_deploy_actions_per_receipt` from the runtime config — lowered from 100 to 10 in
// protocol version 84 (`core/parameters/res/runtime_configs/84.yaml`).
const MAX_DEPLOY_ACTIONS_PER_RECEIPT = 10;

export const totalNumberOfDeployActionsExceeded = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const numberOfDeployActions = MAX_DEPLOY_ACTIONS_PER_RECEIPT + 1;

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
      // `validate_number_of_deploy_actions` only counts the deploy actions, and the wasm
      // itself is never compiled at this stage — empty code keeps the transaction small.
      actions: Array.from({ length: numberOfDeployActions }, () =>
        deployContract({ wasmBytes: new Uint8Array() }),
      ),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertUnmappedInvalidTxError(tx, {
    ActionsValidation: {
      TotalNumberOfDeployActionsExceeded: {
        limit: MAX_DEPLOY_ACTIONS_PER_RECEIPT,
        numberOfDeployActions,
      },
    },
  });
};
