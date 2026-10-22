import { addAccessKey, randomEd25519KeyPair } from '../../../../../../../../index';
import { signTransaction } from '../../../../../../../../src/transaction/signTransaction/signTransaction';
import type { ContractFunctionCallPermission } from '../../../../../../../../types/_common/accessKey';
import type { NearTokenArgs } from '../../../../../../../../types/_common/nearToken';
import { getLastNonce } from '../../../../../../../utils/getLastNonce';
import type { TestContext } from '../../executeDelegation.test';

type AttachContractFunctionCallKeyArgs = Omit<ContractFunctionCallPermission, 'kind'> & {
  allowance: 'Unlimited' | NearTokenArgs;
};

/**
 * Attach a fresh `ContractFunctionCall` access key to `alice` and return its key pair, so a case
 * can sign a delegation with a key whose permission the node is expected to reject when the
 * delegation is executed.
 */
export const attachContractFunctionCallKey = async (
  context: TestContext,
  { allowance, ...permission }: AttachContractFunctionCallKeyArgs,
) => {
  const { client, defaultKeyPair } = context;

  const contractFunctionCallKeyPair = randomEd25519KeyPair();

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signer: {
        accountId: 'alice',
        publicKey: defaultKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(aliceAccessKey.accessKey) + 1,
        },
      },
      recentBlockHash: aliceAccessKey.atMomentOf.blockHash,
      action: addAccessKey({
        publicKey: contractFunctionCallKeyPair.publicKey,
        permission: { kind: 'ContractFunctionCall', ...permission },
        gasPayment: { source: 'AccountBalance', allowance },
      }),
      receiverAccountId: 'alice',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  return contractFunctionCallKeyPair;
};
