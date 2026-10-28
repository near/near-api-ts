import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMemoryVault,
  createSigner,
  type MemoryVault,
  near,
  randomEd25519KeyPair,
  stake,
} from '../../../../../../../../index';
import { assertNatErrKind } from '../../../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../../../utils/common';
import { startSandbox } from '../../../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Action.Stake.ValidatorStake.AlreadyZero', () => {
  let client: Client;
  let keyVault: MemoryVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyVault = createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY });
    return () => sandbox.stop();
  });

  it('fails with Transaction.Action.Stake.ValidatorStake.AlreadyZero when staking zero with an unknown validator key', async () => {
    const nat = createSigner({ signerAccountId: 'nat', client, keyVault });

    const res = await nat.safeExecuteTransaction({
      intent: {
        action: stake({
          amount: near('0'),
          validatorPublicKey: randomEd25519KeyPair().publicKey,
        }),
        receiverAccountId: nat.signerAccountId,
      },
    });

    assertNatErrKind(res, 'Signer.ExecuteTransaction.Rpc.Action.Stake.ValidatorStake.AlreadyZero');
  });
});
