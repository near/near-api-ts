import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import {
  type AccountId,
  addAccessKey,
  type Client,
  callContractFunction,
  constants,
  createMemoryVault,
  createSigner,
  createSubAccount,
  createVaultSignService,
  type PublicKey,
  randomEd25519KeyPair,
  type Signer,
  transfer,
} from '../../../../index';
import { createDefaultClient } from '../../../utils/common';
import { getLastNonce } from '../../../utils/getLastNonce';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { relay } from './_common/relay';

z.config(z.locales.en());
describe('Signer.signDelegation', async () => {
  let client: Client;

  // A new signer each time, so its key pool starts from the nonce on chain
  const createAlice = () =>
    createSigner({
      signerAccountId: 'alice',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

  const intent = {
    delegatedAction: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'bob',
    expiration: { inBlocks: 1000 },
  };

  const getNonce = async (accountId: AccountId, publicKey: PublicKey) => {
    const { accessKey } = await client.getAccessKey({
      accountId,
      publicKey,
      atMomentOf: 'LatestOptimisticBlock',
    });
    return getLastNonce(accessKey);
  };

  // A transaction of the key's own, sent by the signer that signed the delegation
  const transferBy = (signer: Signer) =>
    signer.safeExecuteTransaction({
      intent: { action: transfer({ amount: { yoctoNear: '1' } }), receiverAccountId: 'bob' },
      minimalProcessingStage: 'CompletedFinal',
    });

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('signs a delegation 100 nonces ahead of the key, which a relayer executes', async () => {
    const alice = createAlice();
    const nonce = await getNonce('alice', DEFAULT_PUBLIC_KEY);

    const signed = await alice.signDelegation({ intent });

    expect(signed.signedDelegation.delegation).toMatchObject({
      tag: constants.Delegation.Nep366Tag,
      delegator: {
        accountId: 'alice',
        publicKey: DEFAULT_PUBLIC_KEY,
        replayProtection: { nonce: nonce + 100 },
      },
      delegatedActions: [intent.delegatedAction],
      receiverAccountId: 'bob',
    });

    const relayed = await relay(client, signed);
    expect(relayed.success).toBe(true);

    // A delegation sets the key's nonce to its own
    expect(await getNonce('alice', DEFAULT_PUBLIC_KEY)).toBe(nonce + 100);
  });

  it('keeps a delegation valid when the key sends a transaction before the relayer does', async () => {
    const alice = createAlice();
    const nonce = await getNonce('alice', DEFAULT_PUBLIC_KEY);

    const signed = await alice.signDelegation({ intent });

    // The transaction takes the next nonce - below the delegation's
    expect((await transferBy(alice)).success).toBe(true);
    expect(await getNonce('alice', DEFAULT_PUBLIC_KEY)).toBe(nonce + 1);

    expect((await relay(client, signed)).success).toBe(true);
    expect(await getNonce('alice', DEFAULT_PUBLIC_KEY)).toBe(nonce + 100);
  });

  it("moves the key's next transaction above a delegation that landed", async () => {
    const alice = createAlice();
    const nonce = await getNonce('alice', DEFAULT_PUBLIC_KEY);

    const signed = await alice.signDelegation({ intent });
    expect((await relay(client, signed)).success).toBe(true);

    // The signer doesn't know the delegation landed: its send gets Nonce.Invalid, and the retry
    // takes the nonce after the delegation's
    expect((await transferBy(alice)).success).toBe(true);
    expect(await getNonce('alice', DEFAULT_PUBLIC_KEY)).toBe(nonce + 101);
  });

  it('keeps delegations signed in a row valid in that order', async () => {
    const alice = createAlice();
    const nonce = await getNonce('alice', DEFAULT_PUBLIC_KEY);

    const first = await alice.signDelegation({ intent });
    const second = await alice.signDelegation({ intent });

    expect(first.signedDelegation.delegation.delegator.replayProtection.nonce).toBe(nonce + 100);
    expect(second.signedDelegation.delegation.delegator.replayProtection.nonce).toBe(nonce + 200);

    expect((await relay(client, first)).success).toBe(true);
    expect((await relay(client, second)).success).toBe(true);
    expect(await getNonce('alice', DEFAULT_PUBLIC_KEY)).toBe(nonce + 200);
  });

  it('signs a single call by an FC key when the account has no FA key', async () => {
    const fcKeyPair = randomEd25519KeyPair();

    // An account whose only key may call any function of bob
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

    const user = createSigner({
      signerAccountId: 'fc.nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: fcKeyPair.privateKey }),
      }),
    });
    const nonce = await getNonce('fc.nat', fcKeyPair.publicKey);

    const signed = await user.signDelegation({
      intent: {
        delegatedAction: callContractFunction({
          functionName: 'ping',
          gasLimit: { teraGas: '10' },
        }),
        receiverAccountId: 'bob',
        expiration: { inBlocks: 1000 },
      },
    });
    expect(signed.signedDelegation.delegation.delegator.publicKey).toBe(fcKeyPair.publicKey);

    // The node checks the key's permission before it takes the delegation's nonce
    expect((await relay(client, signed)).success).toBe(true);
    expect(await getNonce('fc.nat', fcKeyPair.publicKey)).toBe(nonce + 100);
  });
});
