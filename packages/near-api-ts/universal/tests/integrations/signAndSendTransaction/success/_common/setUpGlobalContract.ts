import { publishLinkableGlobalContract, publishPinnableGlobalContract } from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import type { AccountId } from '../../../../../types/_common/common';
import type { KeyPair } from '../../../../../types/_common/keyPairs/keyPair';
import type { DelegableAction } from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import type { Client } from '../../../../../types/client/client';
import { getFileBytes } from '../../../../utils/common';
import { getLastNonce } from '../../../../utils/getLastNonce';

const WASM_PATH = './wasm/write-get-record.wasm';

export type SetUpGlobalContractArgs = {
  client: Client;
  /** The account that publishes the code, and pays the one-off global storage cost. */
  publisherAccountId: AccountId;
  publisherKeyPair: KeyPair;
};

/**
 * Send the publish action as a self-addressed transaction - all three global contract actions
 * require the actor to be the account they act on.
 *
 * Publishing does not distribute the code synchronously: the action emits a
 * `GlobalContractDistribution` receipt that carries no execution outcome, so no processing stage
 * covers it. Waiting for the publication to reach `CompletedFinal` is enough - that receipt is
 * applied in the block right after the publication, long before the pin/link is even signed.
 */
const sendPublication = async (args: SetUpGlobalContractArgs, action: DelegableAction) => {
  const { client, publisherAccountId, publisherKeyPair } = args;

  const publisherAccessKey = await client.getAccessKey({
    accountId: publisherAccountId,
    publicKey: publisherKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: publisherKeyPair,
    transaction: {
      signer: {
        accountId: publisherAccountId,
        publicKey: publisherKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(publisherAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: publisherAccessKey.atMomentOf.blockHash,
      action,
      receiverAccountId: publisherAccountId,
    },
  });

  return client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });
};

/** Publish code under the publisher account id, so that it can be linked to. */
export const setUpLinkableGlobalContract = async (args: SetUpGlobalContractArgs) => {
  await sendPublication(
    args,
    publishLinkableGlobalContract({ wasmU8: await getFileBytes(WASM_PATH) }),
  );

  return { globalContractAccountId: args.publisherAccountId };
};

/** Publish code under its wasm hash, so that it can be pinned. */
export const setUpPinnableGlobalContract = async (args: SetUpGlobalContractArgs) => {
  const tx = await sendPublication(
    args,
    publishPinnableGlobalContract({ wasmU8: await getFileBytes(WASM_PATH) }),
  );

  // Nearcore hands the hash of the published wasm back in the action summary, so the pin
  // identifier comes from the publication itself rather than from a locally computed hash.
  const [actionSummary] = tx.processingSteps.conversionStep.transactionSummary.actionSummaries;

  if (actionSummary?.actionType !== 'PublishPinnableGlobalContract')
    throw new Error(
      `Expected a PublishPinnableGlobalContract summary, got ${actionSummary?.actionType}`,
    );

  return { globalContractWasmHash: actionSummary.contractWasmHash };
};
