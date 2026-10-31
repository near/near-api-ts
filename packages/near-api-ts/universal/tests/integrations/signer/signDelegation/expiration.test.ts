import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  type DelegationIntent,
  transfer,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { relay } from './_common/relay';

z.config(z.locales.en());
describe('Signer.signDelegation › expiration', async () => {
  let client: Client;

  const createAlice = () =>
    createSigner({
      signerAccountId: 'alice',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

  const intentExpiring = (expiration: DelegationIntent['expiration']) => ({
    delegatedAction: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'bob',
    expiration,
  });

  const getLatestHeight = async () => {
    const block = await client.getBlock({ blockReference: 'LatestOptimisticBlock' });
    return block.rawRpcResult.header.height;
  };

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('signs the height inBlocks after the latest block', async () => {
    const heightBefore = await getLatestHeight();
    const signed = await createAlice().signDelegation({
      intent: intentExpiring({ inBlocks: 1000 }),
    });
    const heightAfter = await getLatestHeight();

    const { blockHeight } = signed.signedDelegation.delegation.expiration;
    expect(blockHeight).toBeGreaterThanOrEqual(heightBefore + 1000);
    expect(blockHeight).toBeLessThanOrEqual(heightAfter + 1000);

    expect((await relay(client, signed)).success).toBe(true);
  });

  it('signs a block height as it is', async () => {
    const blockHeight = (await getLatestHeight()) + 1000;
    const signed = await createAlice().signDelegation({ intent: intentExpiring({ blockHeight }) });

    expect(signed.signedDelegation.delegation.expiration).toEqual({ blockHeight });
    expect((await relay(client, signed)).success).toBe(true);
  });

  it('expires once the blocks it was signed for are over', async () => {
    const signed = await createAlice().signDelegation({ intent: intentExpiring({ inBlocks: 1 }) });
    const { blockHeight } = signed.signedDelegation.delegation.expiration;

    // A relayer's transaction lands in a block after the latest one
    while ((await getLatestHeight()) <= blockHeight)
      await new Promise((resolve) => setTimeout(resolve, 50));

    const relayed = await relay(client, signed);
    assertNatErrKind(relayed, 'Signer.ExecuteTransaction.Rpc.Action.ExecuteDelegation.Expired');
  });
});
