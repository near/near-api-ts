import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import * as z from 'zod/mini';
import {
  addAccessKey,
  type Client,
  callContractFunction,
  createMemoryVault,
  createSigner,
  createSubAccount,
  createVaultSignService,
  type MemoryVault,
  randomEd25519KeyPair,
  transfer,
} from '../../../../../../index';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('executeTransaction › KeyPool.SigningKey.NotFound', async () => {
  let client: Client;
  let keyVault: MemoryVault;

  const keyPair1 = randomEd25519KeyPair();

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyVault = createMemoryVault({
      privateKeys: [DEFAULT_PRIVATE_KEY, keyPair1.privateKey],
    });

    // Create a new user with an FC key only
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({ vault: keyVault }),
    });

    await nat.executeTransaction({
      intent: {
        actions: [
          createSubAccount(),
          addAccessKey({
            publicKey: keyPair1.publicKey,
            permission: {
              kind: 'ContractFunctionCall',
              allowedContract: 'abc',
              allowedFunctions: 'AllNonPayable',
            },
            gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
          }),
          transfer({ amount: { near: '10' } }),
        ],
        receiverAccountId: 'user.nat',
      },
    });

    return () => sandbox.stop();
  });

  it('fails with KeyPool.SigningKey.NotFound when no key in the pool can sign', async () => {
    // Try to sign FA transaction with an FC key
    const user = createSigner({
      signerAccountId: 'user.nat',
      client,
      signService: createVaultSignService({ vault: keyVault }),
    });

    const tx = await user.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'nat',
      },
    });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.KeyPool.SigningKey.NotFound');
  });

  it('fails with KeyPool.SigningKey.NotFound for a call with a deposit, which an FC key cannot attach', async () => {
    const user = createSigner({
      signerAccountId: 'user.nat',
      client,
      signService: createVaultSignService({ vault: keyVault }),
    });

    // The FC key allows the contract and the function, but not the deposit
    const tx = await user.safeExecuteTransaction({
      intent: {
        action: callContractFunction({
          functionName: 'any_function',
          gasLimit: { teraGas: '10' },
          attachedDeposit: { yoctoNear: '1' },
        }),
        receiverAccountId: 'abc',
      },
    });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.KeyPool.SigningKey.NotFound');
  });
});
