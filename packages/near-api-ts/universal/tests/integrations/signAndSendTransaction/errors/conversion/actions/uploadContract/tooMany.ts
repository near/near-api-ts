import { expect } from 'vitest';
import {
  deployLocalContract,
  publishLinkableGlobalContract,
  publishPinnableGlobalContract,
} from '../../../../../../../index';
import { signTransaction } from '../../../../../../../src/transaction/signTransaction/signTransaction';
import { assertNatErrKind } from '../../../../../../utils/assertNatErrKind';
import { getLastNonce } from '../../../../../../utils/getLastNonce';
import type { TestContext } from '../actions.test';

// `max_deploy_actions_per_receipt` from the runtime config — lowered from 100 to 10 in
// protocol version 84 (`core/parameters/res/runtime_configs/84.yaml`).
const MAX_DEPLOY_ACTIONS_PER_RECEIPT = 10;

export const uploadContractTooMany = (context: TestContext) => async () => {
  const { client, defaultKeyPair } = context;

  const uploadContractActionsCount = MAX_DEPLOY_ACTIONS_PER_RECEIPT + 1;

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  // `validate_number_of_deploy_actions` counts local deploys and global publications together,
  // and the wasm itself is never compiled at this stage — empty code keeps the transaction small.
  const wasmU8 = new Uint8Array();

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'nat',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(natAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: natAccessKey.atMomentOf.blockHash,
      actions: Array.from({ length: uploadContractActionsCount }, (_, index) => {
        if (index % 3 === 0) return deployLocalContract({ wasmU8 });
        if (index % 3 === 1) return publishPinnableGlobalContract({ wasmU8 });
        return publishLinkableGlobalContract({ wasmU8 });
      }),
      receiverAccountId: 'nat',
    },
  });

  const tx = await client.safeSendSignedTransaction({ signedTransaction });

  assertNatErrKind(tx, 'Client.SendSignedTransaction.Rpc.Actions.UploadContract.TooMany');
  expect(tx.error.context.info).toStrictEqual({
    uploadContractActionsCount,
    maximumUploadContractActionsCount: MAX_DEPLOY_ACTIONS_PER_RECEIPT,
  });
};
