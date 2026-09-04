import {
  registerLinkableGlobalContract,
  registerPinnableGlobalContract,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import type { AccountId } from '../../../../../types/_common/common';
import type { KeyPair } from '../../../../../types/_common/keyPairs/keyPair';
import type { DelegableAction } from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import type { Client } from '../../../../../types/client/client';
import { getFileBytes } from '../../../../utils/common';

const WASM_PATH = './wasm/write-get-record.wasm';

export type PublishGlobalContractArgs = {
  client: Client;
  /** The account that registers the code, and pays the one-off global storage cost. */
  registrarAccountId: AccountId;
  registrarKeyPair: KeyPair;
};

/**
 * Send the register action as a self-addressed transaction - all three global contract actions
 * require the actor to be the account they act on.
 *
 * Registering does not publish the code synchronously: the action emits a
 * `GlobalContractDistribution` receipt that carries no execution outcome, so no processing stage
 * covers it. Waiting for the registration to reach `CompletedFinal` is enough - that receipt is
 * applied in the block right after the registration, long before the pin/link is even signed.
 */
const sendRegistration = async (args: PublishGlobalContractArgs, action: DelegableAction) => {
  const { client, registrarAccountId, registrarKeyPair } = args;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: registrarAccountId,
    publicKey: registrarKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: registrarKeyPair,
    transaction: {
      signerAccountId: registrarAccountId,
      signerPublicKey: registrarKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      action,
      receiverAccountId: registrarAccountId,
    },
  });

  return client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });
};

/** Register code under the registrar account id, so that it can be linked to. */
export const publishLinkableGlobalContract = async (args: PublishGlobalContractArgs) => {
  await sendRegistration(
    args,
    registerLinkableGlobalContract({ wasmU8: await getFileBytes(WASM_PATH) }),
  );

  return { globalContractAccountId: args.registrarAccountId };
};

/** Register code under its wasm hash, so that it can be pinned. */
export const publishPinnableGlobalContract = async (args: PublishGlobalContractArgs) => {
  const tx = await sendRegistration(
    args,
    registerPinnableGlobalContract({ wasmU8: await getFileBytes(WASM_PATH) }),
  );

  // Nearcore hands the hash of the registered wasm back in the action summary, so the pin
  // identifier comes from the registration itself rather than from a locally computed hash.
  const [actionSummary] = tx.processingSteps.conversionStep.transactionSummary.actionSummaries;

  if (actionSummary?.actionType !== 'RegisterPinnableGlobalContract')
    throw new Error(
      `Expected a RegisterPinnableGlobalContract summary, got ${actionSummary?.actionType}`,
    );

  return { globalContractWasmHash: actionSummary.contractWasmHash };
};
