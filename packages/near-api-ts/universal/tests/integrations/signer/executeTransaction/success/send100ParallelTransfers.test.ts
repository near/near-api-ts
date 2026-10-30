import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addAccessKey,
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  randomEd25519KeyPair,
  transfer,
} from '../../../../../index';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

describe('executeTransaction › success', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('sends 100 parallel native transfers using 10 ContractFunctionCall keys', async () => {
    const keyPairs = new Array(9).fill(0).map(() => randomEd25519KeyPair());

    const keyVault = createMemoryVault({
      privateKeys: [DEFAULT_PRIVATE_KEY, ...keyPairs.map((kp) => kp.privateKey)],
    });

    const baseSigner = createSigner({
      signerAccountId: 'nat',
      signService: createVaultSignService({ vault: keyVault }),
      client,
    });

    await baseSigner.executeTransaction({
      intent: {
        actions: keyPairs.map((keyPair) =>
          addAccessKey({
            publicKey: keyPair.publicKey,
            permission: { kind: 'FullAccess' },
            gasPayment: { source: 'AccountBalance' },
          }),
        ),
        receiverAccountId: baseSigner.signerAccountId,
      },
    });

    const signer = createSigner({
      signerAccountId: 'nat',
      signService: createVaultSignService({ vault: keyVault }),
      client,
    });

    // 4. Send 100 transfer transactions in parallel
    const sendNearTokensResults = await Promise.all(
      new Array(100).fill(0).map((_, index) =>
        signer.executeTransaction({
          intent: {
            action: transfer({
              amount: { yoctoNear: BigInt(index.toString() + 1) },
            }),
            receiverAccountId: 'bob',
          },
        }),
      ),
    );

    // log(sendNearTokensResults);

    sendNearTokensResults.forEach((result) => console.log(result.transactionHash, result));
  });
});
