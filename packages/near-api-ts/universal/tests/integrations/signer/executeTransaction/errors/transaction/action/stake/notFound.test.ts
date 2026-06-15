import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMemoryKeyService,
  createMemorySignerFactory,
  type MemoryKeyService,
  type MemorySignerFactory,
  near,
  randomEd25519KeyPair,
  stake,
} from '../../../../../../../../index';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Action.Stake.NotFound', () => {
  let client: Client;
  let keyService: MemoryKeyService;
  let createSigner: MemorySignerFactory;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });
    createSigner = createMemorySignerFactory({ client, keyService });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.Stake.NotFound when staking zero with an unknown validator key', async () => {
    const nat = createSigner('nat');

    const res = await nat.safeExecuteTransaction({
      intent: {
        action: stake({
          amount: near('0'),
          validatorPublicKey: randomEd25519KeyPair().publicKey,
        }),
        receiverAccountId: nat.signerAccountId,
      },
    });

    assertNatErrKind(res, 'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.NotFound');
  });
});
