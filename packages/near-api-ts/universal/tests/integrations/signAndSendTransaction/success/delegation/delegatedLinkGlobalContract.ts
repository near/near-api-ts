import { expect } from 'vitest';
import {
  executeDelegation,
  functionCall,
  linkGlobalContract,
  signDelegation,
} from '../../../../../index';
import { signTransaction } from '../../../../../src/transaction/signTransaction/signTransaction';
import { getLastNonce } from '../../../../utils/getLastNonce';
import { publishLinkableGlobalContract } from '../_common/publishGlobalContract';
import type { TestContext } from './delegation.test';

export const delegatedLinkGlobalContract = (context: TestContext) => async () => {
  const { client, defaultKeyPair, relayKeyPair } = context;
  const delegatorAccountId = 'alice';

  const { globalContractAccountId } = await publishLinkableGlobalContract({
    client,
    registrarAccountId: 'nat',
    registrarKeyPair: defaultKeyPair,
  });

  const delegatorAccessKey = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: defaultKeyPair.publicKey,
  });

  // The actor of a delegated action is the delegator, and linking acts on the actor's own account -
  // so the delegation is addressed back to the delegator.
  const signedDelegation = await signDelegation({
    signDataProvider: defaultKeyPair,
    delegation: {
      delegatorAccountId,
      delegatorPublicKey: defaultKeyPair.publicKey,
      delegatedActions: [
        linkGlobalContract({ globalContractAccountId }),
        functionCall({
          functionName: 'write_record',
          functionArgs: { record_id: 0, record: 'Hello' },
          gasLimit: { teraGas: '100' },
        }),
      ],
      receiverAccountId: delegatorAccountId,
      nonce: getLastNonce(delegatorAccessKey.accessKey) + 1,
      expiration: { blockHeight: delegatorAccessKey.atMomentOf.blockHeight + 100 },
    },
  });

  // `relay` wraps the signed delegation into its own transaction and pays for it. The transaction
  // receiver must be the delegator, the only receiver a delegation may be sent to.
  const relayAccessKey = await client.getAccessKey({
    accountId: 'relay',
    publicKey: relayKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: relayKeyPair,
    transaction: {
      signerAccountId: 'relay',
      signerPublicKey: relayKeyPair.publicKey,
      nonce: getLastNonce(relayAccessKey.accessKey) + 1,
      blockHash: relayAccessKey.atMomentOf.blockHash,
      action: executeDelegation(signedDelegation),
      receiverAccountId: delegatorAccountId,
    },
  });

  const tx = await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'ExecutedNearlyFinal',
  });

  expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries).toMatchObject([
    {
      actionType: 'ExecuteDelegation',
      delegation: {
        delegatorAccountId,
        receiverAccountId: delegatorAccountId,
        delegatedActionSummaries: [
          { actionType: 'LinkGlobalContract', globalContractAccountId },
          { actionType: 'FunctionCall', functionName: 'write_record' },
        ],
      },
    },
  ]);

  const { contract } = await client.getAccountInfo({ accountId: delegatorAccountId });

  expect(contract).toStrictEqual({ status: 'Linked', globalContractAccountId });

  const { result } = await client.callContractReadFunction({
    contractAccountId: delegatorAccountId,
    functionName: 'get_record',
    functionArgs: { record_id: 0 },
  });

  expect(result).toBe('Hello');
};
