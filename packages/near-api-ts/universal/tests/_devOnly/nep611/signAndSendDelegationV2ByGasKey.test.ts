import { it } from 'vitest';
import {
  addAccessKey,
  createMainnetClient,
  executeDelegation,
  keyPair,
  signDelegation,
  signTransaction,
  topUpAccessKeyBalance,
  transfer,
  withdrawAccessKeyBalance,
} from '../../../index';
import { nonceChannels } from '../../integrations/signAndSendTransaction/success/replayProtection/nonceChannels';
import { log } from '../../utils/common';
import { getLastNonce } from '../../utils/getLastNonce';

// Mainnet transaction - want to be able to test delegateV2 + gasKeys after 2.14 release

// Added gas key - tx: aXPdG7bYXmZ8p4JwRMqdacF8sekqHMJJrfBVhUZYwAJ

// Executed Delegation, signed by gas key
//   Success (transfer): 9iukKMPYiwtWNxJxd6XfnaktwCPuiJRHmLGv4ESEYWzH
//   Success (WithdrawAccessKeyBalance): 86Ait5akHb7LF1dEdT4WACCSZUtPUvoYDhVBABRmG9ap
//   Error - DelegateActionInvalidNonceIndex: HdbSynSQmGBDeq4GHZAaZQYSwHH5nX1ivWm1Xxpv2rnH
//   Error - DelegateActionRequiresNonGasKey: CKyEiCLYiMo1EH7CnjLA8fcTY59FdoPk1tsLSKN3BJ4q
//   Error - DelegateActionRequiresGasKey: DQtKJxfAxyp67SCGWCaeHQxv5wbfyawCYWiFP2QZW7kY

const delegatorAccountId = 'lantstool.near';
const delegatorKeyPair = keyPair(
  'ed25519:3KH3', // ABFA
);
const delegatorGasKeyPair = keyPair(
  'ed25519:65fnD3h', // KBFA
);

const relayAccountId = 'lants.near';
const relayKeyPair = keyPair('ed25519:556g');

it('signAndSendDelegationV2ByGasKey', async () => {
  const client = createMainnetClient();

  // // 1. Create delegation
  const delegatorKbAccessKey = await client.getAccessKey({
    accountId: delegatorAccountId,
    publicKey: delegatorGasKeyPair.publicKey,
  });
  log(delegatorKbAccessKey);

  const nonceChannels = await client.getAccessKeyNonceChannels({
    accountId: delegatorAccountId,
    publicKey: delegatorGasKeyPair.publicKey,
  });

  const delegation = await signDelegation({
    signDataProvider: delegatorGasKeyPair,
    delegation: {
      delegator: {
        accountId: delegatorAccountId,
        publicKey: delegatorGasKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannels',
          nonceChannelId: 0,
          nonce: nonceChannels.nonceChannels[0].lastNonce + 1,
        },
      },
      delegatedAction: withdrawAccessKeyBalance({
        amount: { near: '0.001' },
        publicKey: delegatorGasKeyPair.publicKey,
      }),
      receiverAccountId: delegatorAccountId,
      expiration: { blockHeight: delegatorKbAccessKey.atMomentOf.blockHeight + 1000 },
    },
  });

  // 2. Execute delegation by relay

  const relayAccessKey = await client.getAccessKey({
    accountId: relayAccountId,
    publicKey: relayKeyPair.publicKey,
  });

  const signedTransaction = await signTransaction({
    signDataProvider: relayKeyPair,
    transaction: {
      signer: {
        accountId: relayAccountId,
        publicKey: relayKeyPair.publicKey,
        replayProtection: {
          scheme: 'NonceChannel',
          nonce: getLastNonce(relayAccessKey.accessKey) + 1,
        },
      },
      action: executeDelegation(delegation),
      receiverAccountId: delegatorAccountId,
      recentBlockHash: relayAccessKey.atMomentOf.blockHash,
    },
  });

  const tx = await client.safeSendSignedTransaction({
    signedTransaction,
  });

  log(tx);
});
