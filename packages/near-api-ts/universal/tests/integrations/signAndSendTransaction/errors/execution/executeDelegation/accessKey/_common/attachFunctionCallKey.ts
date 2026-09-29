import { addFunctionCallKey, randomEd25519KeyPair } from '../../../../../../../../index';
import { signTransaction } from '../../../../../../../../src/transaction/signTransaction/signTransaction';
import type { CreateAddFunctionCallKeyActionArgs } from '../../../../../../../../types/_common/transaction/actions/delegableActions/addKey';
import { getLastNonce } from '../../../../../../../utils/getLastNonce';
import type { TestContext } from '../../executeDelegation.test';

type AttachFunctionCallKeyArgs = Omit<CreateAddFunctionCallKeyActionArgs, 'publicKey'>;

/**
 * Attach a fresh function-call access key to `alice` and return its key pair, so a case can sign
 * a delegation with a key whose permission the node is expected to reject when the delegation
 * is executed.
 */
export const attachFunctionCallKey = async (
  context: TestContext,
  args: AttachFunctionCallKeyArgs,
) => {
  const { client, defaultKeyPair } = context;

  const functionCallKeyPair = randomEd25519KeyPair();

  const {
    accessKey,
    atMomentOf: { blockHash },
  } = await client.getAccessKey({
    accountId: 'alice',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'alice',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: getLastNonce(accessKey) + 1,
      blockHash,
      action: addFunctionCallKey({ publicKey: functionCallKeyPair.publicKey, ...args }),
      receiverAccountId: 'alice',
    },
  });

  await client.sendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  return functionCallKeyPair;
};
