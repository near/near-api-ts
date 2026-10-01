import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addAccessKey,
  type Client,
  keyPair,
  near,
  randomEd25519KeyPair,
  randomSecp256k1KeyPair,
} from '../../../../index';
import { signTransaction } from '../../../../src/transaction/signTransaction/signTransaction';
import { createDefaultClient } from '../../../utils/common';
import { getLastNonce } from '../../../utils/getLastNonce';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

describe('signAndSendTransaction › addAccessKey', () => {
  let client: Client;
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('adds a key of each variant and reads them back', async () => {
    const [fullAccessKey, functionCallKey, gasFullAccessKey, gasFunctionCallKey] = [
      randomEd25519KeyPair(),
      randomSecp256k1KeyPair(),
      randomEd25519KeyPair(),
      randomSecp256k1KeyPair(),
    ];

    const functionCallPermission = {
      kind: 'FunctionCall' as const,
      allowedContract: 'alice',
      allowedFunctions: ['ping', 'pong'],
    };

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
        actions: [
          addAccessKey({
            publicKey: fullAccessKey.publicKey,
            permission: { kind: 'FullAccess' },
            gasPayment: { source: 'AccountBalance' },
          }),
          addAccessKey({
            publicKey: functionCallKey.publicKey,
            permission: functionCallPermission,
            gasPayment: { source: 'AccountBalance', allowance: near('0.25') },
          }),
          addAccessKey({
            publicKey: gasFullAccessKey.publicKey,
            permission: { kind: 'FullAccess' },
            gasPayment: { source: 'KeyBalance' },
            replayProtection: { channelCount: 1024 },
          }),
          addAccessKey({
            publicKey: gasFunctionCallKey.publicKey,
            permission: {
              kind: 'FunctionCall',
              allowedContract: 'bob',
              allowedFunctions: 'AllNonPayable',
            },
            gasPayment: { source: 'KeyBalance' },
            replayProtection: { channelCount: 3 },
          }),
        ],
        receiverAccountId: 'nat',
      },
    });

    const tx = await client.sendSignedTransaction({
      signedTransaction,
      minimalProcessingStage: 'ExecutedNearlyFinal',
    });

    const { actionSummaries } = tx.processingSteps.conversionStep.transactionSummary;

    expect(actionSummaries).toMatchObject([
      {
        actionType: 'AddAccessKey',
        publicKey: fullAccessKey.publicKey,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'AccountBalance' },
      },
      {
        actionType: 'AddAccessKey',
        publicKey: functionCallKey.publicKey,
        permission: functionCallPermission,
        gasPayment: { source: 'AccountBalance', allowance: { near: '0.25' } },
      },
      {
        actionType: 'AddAccessKey',
        publicKey: gasFullAccessKey.publicKey,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'KeyBalance' },
        replayProtection: { channelCount: 1024 },
      },
      {
        actionType: 'AddAccessKey',
        publicKey: gasFunctionCallKey.publicKey,
        permission: {
          kind: 'FunctionCall',
          allowedContract: 'bob',
          allowedFunctions: 'AllNonPayable',
        },
        gasPayment: { source: 'KeyBalance' },
        replayProtection: { channelCount: 3 },
      },
    ]);

    // An ordinary key's summary carries exactly the fields of the action - nothing of a gas key
    expect(Object.keys(actionSummaries[0] ?? {}).sort()).toStrictEqual(
      ['actionType', 'gasPayment', 'permission', 'publicKey'].sort(),
    );

    const { accessKeys } = await client.getAccessKeys({ accountId: 'nat' });

    const findKey = ({ publicKeyRef }: { publicKeyRef: string }) =>
      accessKeys.find((key) => key.publicKeyRef === publicKeyRef);

    expect(findKey(fullAccessKey)).toMatchObject({
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
      replayProtection: { scheme: 'NonceChannel' },
    });

    expect(findKey(functionCallKey)).toMatchObject({
      permission: functionCallPermission,
      gasPayment: { source: 'AccountBalance', allowance: { near: '0.25' } },
      replayProtection: { scheme: 'NonceChannel' },
    });

    // A gas key starts empty: it is funded by a TransferToGasKey action afterwards
    expect(findKey(gasFullAccessKey)).toMatchObject({
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'KeyBalance', balance: { yoctoNear: 0n } },
      replayProtection: { scheme: 'NonceChannels', channelCount: 1024 },
    });

    expect(findKey(gasFunctionCallKey)).toMatchObject({
      permission: {
        kind: 'FunctionCall',
        allowedContract: 'bob',
        allowedFunctions: 'AllNonPayable',
      },
      gasPayment: { source: 'KeyBalance', balance: { yoctoNear: 0n } },
      replayProtection: { scheme: 'NonceChannels', channelCount: 3 },
    });
  });
});
