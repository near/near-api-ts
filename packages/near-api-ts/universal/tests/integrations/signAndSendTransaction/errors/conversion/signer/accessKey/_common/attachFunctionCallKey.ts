import { addFunctionCallKey, randomEd25519KeyPair } from '../../../../../../../../index';
import { signTransaction } from '../../../../../../../../src/transaction/signTransaction/signTransaction';
import type { CreateAddFunctionCallKeyActionArgs } from '../../../../../../../../types/_common/transaction/actions/delegableActions/addKey';
import { getLastNonce } from '../../../../../../../utils/getLastNonce';
import type { TestContext } from '../../signer.test';

type AttachFunctionCallKeyArgs = Omit<CreateAddFunctionCallKeyActionArgs, 'publicKey'>;

/**
 * Attach a fresh function-call access key to `nat` and return its key pair, so a case can
 * sign with a key whose permission the node is expected to reject.
 */
export const attachFunctionCallKey = async (
  context: TestContext,
  args: AttachFunctionCallKeyArgs,
) => {
  const { client, defaultKeyPair } = context;

  const functionCallKeyPair = randomEd25519KeyPair();

  const { accessKey, blockHash } = await client.getAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(accessKey) + 1,
      blockHash,
      action: addFunctionCallKey({ publicKey: functionCallKeyPair.publicKey, ...args }),
      receiverAccountId: 'nat',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  return functionCallKeyPair;
};
