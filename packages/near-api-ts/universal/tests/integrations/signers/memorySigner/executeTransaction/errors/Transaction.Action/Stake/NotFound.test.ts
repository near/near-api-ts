import { assertNatErrKind } from '@universal/tests/utils/assertNatErrKind';
import { createDefaultClient } from '@universal/tests/utils/common';
import { startSandbox } from '@universal/tests/utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it, vi } from 'vitest';
import { type Client, createMemoryKeyService, createMemorySignerFactory, type MemoryKeyService, type MemorySignerFactory, near, randomEd25519KeyPair, stake } from '../../../../../../../../index';

vi.setConfig({ testTimeout: 60000 });

describe('Stake', () => {
  let client: Client;
  let keyService: MemoryKeyService;
  let createSigner: MemorySignerFactory;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = await createMemoryKeyService({
      keySource: { privateKey: DEFAULT_PRIVATE_KEY },
    });
    createSigner = createMemorySignerFactory({ client, keyService });
    return () => sandbox.stop();
  });

  it('NotFound', async () => {
    const nat = await createSigner('nat');

    const res = await nat.safeExecuteTransaction({
      intent: {
        action: stake({
          amount: near('0'),
          validatorPublicKey: randomEd25519KeyPair().publicKey,
        }),
        receiverAccountId: nat.signerAccountId,
      },
    });

    assertNatErrKind(
      res,
      'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.NotFound',
    );
  });
});
