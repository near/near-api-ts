import { executeDelegation } from '../../../../../../../../index';
import { signTransaction } from '../../../../../../../../src/transaction/signTransaction/signTransaction';
import type { SignDelegationOutput } from '../../../../../../../../types/_common/transaction/signDelegation';
import type { TestContext } from '../../executeDelegation.test';

/**
 * Wrap a signed delegation into a relayer transaction from `nat` to the delegator `alice` — the
 * only receiver a delegation may be sent to — and send it. Every access key case shares this
 * step; what they vary is the key the delegation is signed with and what it delegates.
 */
export const sendDelegation = async (
  context: TestContext,
  signedDelegation: SignDelegationOutput,
) => {
  const { client, defaultKeyPair } = context;

  const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
    accountId: 'nat',
    publicKey: defaultKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: defaultKeyPair,
    transaction: {
      signerAccountId: 'nat',
      signerPublicKey: defaultKeyPair.publicKey,
      nonce: accountAccessKey.nonce + 1,
      blockHash,
      action: executeDelegation(signedDelegation),
      receiverAccountId: 'alice',
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
    minimalProcessingStage: 'CompletedFinal',
  });

  return { tx, transactionHash: signedTransaction.transactionHash };
};
