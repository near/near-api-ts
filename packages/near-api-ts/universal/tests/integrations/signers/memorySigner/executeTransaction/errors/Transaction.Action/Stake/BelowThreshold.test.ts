import { beforeAll, describe, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  type Client,
  type MemoryKeyService,
  type MemorySignerFactory,
  createMemorySignerFactory,
  stake,
  randomEd25519KeyPair,
  near,
} from '../../../../../../../../index';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';

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

  it('BelowThreshold', async () => {
    const nat = await createSigner('nat');

    const res = await nat.safeExecuteTransaction({
      intent: {
        action: stake({
          amount: near('1'),
          validatorPublicKey: randomEd25519KeyPair().publicKey,
        }),
        receiverAccountId: nat.signerAccountId,
      },
    });

    assertNatErrKind(
      res,
      'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.BelowThreshold',
    );
  });
});
