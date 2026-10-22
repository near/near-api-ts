import { addAccessKey, randomEd25519KeyPair } from '../../../../../../../../index';
import { signTransaction } from '../../../../../../../../src/transaction/signTransaction/signTransaction';
import type { ContractFunctionCallPermission } from '../../../../../../../../types/_common/accessKey';
import type { NearTokenArgs } from '../../../../../../../../types/_common/nearToken';
import { getLastNonce } from '../../../../../../../utils/getLastNonce';
import type { TestContext } from '../../signer.test';

type AttachContractFunctionCallKeyArgs = Omit<ContractFunctionCallPermission, 'kind'> & {
  allowance: 'Unlimited' | NearTokenArgs;
};

/**
 * Attach a fresh `ContractFunctionCall` access key to `nat` and return its key pair, so a case can
 * sign with a key whose permission the node is expected to reject.
 */
export const attachContractFunctionCallKey = async (
  context: TestContext,
  { allowance, ...permission }: AttachContractFunctionCallKeyArgs,
) => {
  const { client, defaultKeyPair } = context;

  const contractFunctionCallKeyPair = randomEd25519KeyPair();

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

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
      action: addAccessKey({
        publicKey: contractFunctionCallKeyPair.publicKey,
        permission: { kind: 'ContractFunctionCall', ...permission },
        gasPayment: { source: 'AccountBalance', allowance },
      }),
      receiverAccountId: 'nat',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  return contractFunctionCallKeyPair;
};
