import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { keyPair } from '../../../src/createMemoryVault/_common/keyPairs/keyPair/keyPair';
import { randomEd25519KeyPair } from '../../../src/createMemoryVault/_common/keyPairs/randomEd25519KeyPair';
import { createMemoryVault } from '../../../src/createMemoryVault/createMemoryVault';
import { createSigner } from '../../../src/createSigner/createSigner';
import { createVaultSignService } from '../../../src/createVaultSignService/createVaultSignService';
import { addAccessKey } from '../../../src/transaction/actionCreators/addAccessKey';
import type { Client } from '../../../types/client/client';
import { createDefaultClient, log } from '../../utils/common';
import { getLastNonce } from '../../utils/getLastNonce';
import { startSandbox } from '../../utils/sandbox/startSandbox';

describe('SendTx', () => {
  let client: Client;
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('send tx', async () => {
    const signService = createVaultSignService({
      vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
    });
    const nat = createSigner({ signerAccountId: 'nat', client, signService });

    const tx = await nat.executeTransaction({
      intent: {
        action: addAccessKey({
          publicKey: randomEd25519KeyPair().publicKey,
          permission: {
            kind: 'ContractFunctionCall',
            allowedContract: 'abc',
            allowedFunctions: 'AllNonPayable',
          },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount: 12 },
        }),
        receiverAccountId: 'nat',
      },
      minimalProcessingStage: 'CompletedFinal',
    });

    log(tx);
  });
});
