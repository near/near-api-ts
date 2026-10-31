import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  executeDelegation,
  type SignDelegationOutput,
} from '../../../../../index';
import { testKeys } from '../../../../utils/testKeys';

/**
 * Send a signed delegation the way a relayer does: `relay` wraps it into a transaction of its
 * own, pays for it and sends it to the delegator.
 */
export const relay = (client: Client, signed: SignDelegationOutput) =>
  createSigner({
    signerAccountId: 'relay',
    client,
    signService: createVaultSignService({
      vault: createMemoryVault({ privateKey: testKeys.a.privateKey }),
    }),
  }).safeExecuteTransaction({
    intent: {
      action: executeDelegation(signed),
      receiverAccountId: signed.signedDelegation.delegation.delegator.accountId,
    },
    minimalProcessingStage: 'CompletedFinal',
  });
