import { addAccessKey, randomEd25519KeyPair } from '../../../../../../../../index';
import { signTransaction } from '../../../../../../../../src/transaction/signTransaction/signTransaction';
import type { FunctionCallPermission } from '../../../../../../../../types/_common/accessKey';
import type { NearTokenArgs } from '../../../../../../../../types/_common/nearToken';
import { getLastNonce } from '../../../../../../../utils/getLastNonce';
import type { TestContext } from '../../signer.test';

type AttachFunctionCallKeyArgs = Omit<FunctionCallPermission, 'kind'> & {
  allowance: 'Unlimited' | NearTokenArgs;
};

/**
 * Attach a fresh function-call access key to `nat` and return its key pair, so a case can
 * sign with a key whose permission the node is expected to reject.
 */
export const attachFunctionCallKey = async (
  context: TestContext,
  { allowance, ...permission }: AttachFunctionCallKeyArgs,
) => {
  const { client, defaultKeyPair } = context;

  const functionCallKeyPair = randomEd25519KeyPair();

  const natAccessKey = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(natAccessKey.accessKey) + 1,
      blockHash: natAccessKey.atMomentOf.blockHash,
      action: addAccessKey({
        publicKey: functionCallKeyPair.publicKey,
        permission: { kind: 'FunctionCall', ...permission },
        gasPayment: { source: 'AccountBalance', allowance },
      }),
      receiverAccountId: 'nat',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  return functionCallKeyPair;
};
