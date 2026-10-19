import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMemoryKeyVault,
  createMemorySigner,
  type MemoryKeyVault,
  near,
  randomEd25519KeyPair,
  stake,
} from '../../../../../../../../index';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Action.Stake.ValidatorStake.AlreadyZero', () => {
  let client: Client;
  let keyVault: MemoryKeyVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyVault = createMemoryKeyVault({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.Stake.ValidatorStake.AlreadyZero when staking zero with an unknown validator key', async () => {
    const nat = createMemorySigner({ signerAccountId: 'nat', client, keyVault });

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
      'MemorySigner.ExecuteTransaction.Rpc.Action.Stake.ValidatorStake.AlreadyZero',
    );
  });
});
