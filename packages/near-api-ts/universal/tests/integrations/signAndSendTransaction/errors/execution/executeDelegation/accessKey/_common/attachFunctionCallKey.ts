import { addAccessKey, randomEd25519KeyPair } from '../../../../../../../../index';
import { signTransaction } from '../../../../../../../../src/transaction/signTransaction/signTransaction';
import type { FunctionCallPermission } from '../../../../../../../../types/_common/accessKey';
import type { NearTokenArgs } from '../../../../../../../../types/_common/nearToken';
import { getLastNonce } from '../../../../../../../utils/getLastNonce';
import type { TestContext } from '../../executeDelegation.test';

type AttachFunctionCallKeyArgs = Omit<FunctionCallPermission, 'kind'> & {
  allowance: 'Unlimited' | NearTokenArgs;
};

/**
 * Attach a fresh function-call access key to `alice` and return its key pair, so a case can sign
 * a delegation with a key whose permission the node is expected to reject when the delegation
 * is executed.
 */
export const attachFunctionCallKey = async (
  context: TestContext,
  { allowance, ...permission }: AttachFunctionCallKeyArgs,
) => {
  const { client, defaultKeyPair } = context;

  const functionCallKeyPair = randomEd25519KeyPair();

  const aliceAccessKey = await client.getAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'alice',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(aliceAccessKey.accessKey) + 1,
      blockHash: aliceAccessKey.atMomentOf.blockHash,
      action: addAccessKey({
        publicKey: functionCallKeyPair.publicKey,
        permission: { kind: 'FunctionCall', ...permission },
        gasPayment: { source: 'AccountBalance', allowance },
      }),
      receiverAccountId: 'alice',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  return functionCallKeyPair;
};
