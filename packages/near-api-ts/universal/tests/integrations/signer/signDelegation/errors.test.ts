import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import {
  addAccessKey,
  type Client,
  callContractFunction,
  createMemoryVault,
  createSigner,
  createSubAccount,
  createVaultSignService,
  randomEd25519KeyPair,
  type SignerClient,
  transfer,
} from '../../../../index';
import { createNatError } from '../../../../src/_common/_common/_common/_common/natError';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('Signer.signDelegation › errors', async () => {
  let client: Client;

  const fcKeyPair = randomEd25519KeyPair();

  const createAlice = (signerClient: SignerClient = client) =>
    createSigner({
      signerAccountId: 'alice',
      client: signerClient,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

  // A signer of an account whose only key may call any function of bob
  const createFcUser = () =>
    createSigner({
      signerAccountId: 'fc.nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: fcKeyPair.privateKey }),
      }),
    });

  const transferIntent = {
    delegatedAction: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'bob',
    expiration: { inBlocks: 1000 },
  };

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);

    await createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    }).executeTransaction({
      intent: {
        actions: [
          createSubAccount(),
          addAccessKey({
            publicKey: fcKeyPair.publicKey,
            permission: {
              kind: 'ContractFunctionCall',
              allowedContract: 'bob',
              allowedFunctions: 'AllNonPayable',
            },
            gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
          }),
          transfer({ amount: { near: '10' } }),
        ],
        receiverAccountId: 'fc.nat',
      },
    });

    return () => sandbox.stop();
  });

  it('fails with Args.InvalidSchema for an intent without an action', async () => {
    const signed = await createAlice().safeSignDelegation({
      // @ts-expect-error a delegation delegates at least one action
      intent: { receiverAccountId: 'bob', expiration: { inBlocks: 1000 } },
    });
    assertNatErrKind(signed, 'Signer.SignDelegation.Args.InvalidSchema');
  });

  it('fails with Args.InvalidSchema for both a block height and a number of blocks', async () => {
    const signed = await createAlice().safeSignDelegation({
      // @ts-expect-error the expiration is a block height or a number of blocks, not both
      intent: { ...transferIntent, expiration: { blockHeight: 1000, inBlocks: 1000 } },
    });
    assertNatErrKind(signed, 'Signer.SignDelegation.Args.InvalidSchema');
  });

  it('fails with Args.InvalidSchema for a number of blocks that is not positive', async () => {
    const signed = await createAlice().safeSignDelegation({
      intent: { ...transferIntent, expiration: { inBlocks: 0 } },
    });
    assertNatErrKind(signed, 'Signer.SignDelegation.Args.InvalidSchema');
  });

  it('fails with KeyPool.Empty when the sign service holds none of the account keys', async () => {
    const alice = createSigner({
      signerAccountId: 'alice',
      client,
      signService: createVaultSignService({ vault: createMemoryVault() }),
    });

    const signed = await alice.safeSignDelegation({ intent: transferIntent });
    assertNatErrKind(signed, 'Signer.SignDelegation.KeyPool.Empty');
  });

  it('fails with KeyPool.SigningKey.NotFound when only an FC key could sign an action that is not a call', async () => {
    const signed = await createFcUser().safeSignDelegation({ intent: transferIntent });
    assertNatErrKind(signed, 'Signer.SignDelegation.KeyPool.SigningKey.NotFound');
  });

  it('fails with KeyPool.SigningKey.NotFound for a call with a deposit, which an FC key cannot attach', async () => {
    const signed = await createFcUser().safeSignDelegation({
      intent: {
        delegatedAction: callContractFunction({
          functionName: 'ping',
          gasLimit: { teraGas: '10' },
          attachedDeposit: { yoctoNear: '1' },
        }),
        receiverAccountId: 'bob',
        expiration: { inBlocks: 1000 },
      },
    });
    assertNatErrKind(signed, 'Signer.SignDelegation.KeyPool.SigningKey.NotFound');
  });

  it('fails with BlockHeight.NotLoaded when the client gives no latest block', async () => {
    const error = createNatError({ kind: 'Client.GetBlock.Timeout', context: { timeoutMs: 1 } });
    const alice = createAlice({
      safeGetAccessKeys: client.safeGetAccessKeys,
      safeGetRecentBlockHash: client.safeGetRecentBlockHash,
      safeGetBlock: (async () => ({
        success: false as const,
        error,
      })) as SignerClient['safeGetBlock'],
      safeSendSignedTransaction: client.safeSendSignedTransaction,
    });

    const signed = await alice.safeSignDelegation({ intent: transferIntent });
    assertNatErrKind(signed, 'Signer.SignDelegation.BlockHeight.NotLoaded');
    expect(signed.error.context.cause).toBe(error);

    // A block height needs no block, so the same signer still signs one
    const signedAtHeight = await alice.safeSignDelegation({
      intent: { ...transferIntent, expiration: { blockHeight: 1000 } },
    });
    expect(signedAtHeight.success).toBe(true);
  });
});
