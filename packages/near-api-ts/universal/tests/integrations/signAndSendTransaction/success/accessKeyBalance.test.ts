import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addAccessKey,
  type Client,
  keyPair,
  near,
  randomEd25519KeyPair,
  type TransactionAction,
  topUpAccessKeyBalance,
  withdrawAccessKeyBalance,
} from '../../../../index';
import { signTransaction } from '../../../../src/transaction/signTransaction/signTransaction';
import { createDefaultClient } from '../../../utils/common';
import { getLastNonce } from '../../../utils/getLastNonce';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

describe('signAndSendTransaction › topUpAccessKeyBalance / withdrawAccessKeyBalance', () => {
  let client: Client;
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);
  // `nat` and `alice` share the genesis key
  const gasKeyPair = randomEd25519KeyPair();

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  const send = async (signerAccountId: string, actions: TransactionAction[]) => {
    const {
      accessKey,
      atMomentOf: { blockHash },
    } = await client.getAccessKey({
      accountId: signerAccountId,
      publicKey: defaultKeyPair.publicKey,
    });

    const signedTransaction = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signerAccountId,
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: getLastNonce(accessKey) + 1,
        blockHash,
        actions,
        receiverAccountId: 'nat',
      },
    });

    return client.sendSignedTransaction({
      signedTransaction,
      minimalProcessingStage: 'CompletedFinal',
    });
  };

  const getGasKeyBalance = async () => {
    const { accessKey } = await client.getAccessKey({
      accountId: 'nat',
      publicKey: gasKeyPair.publicKey,
    });

    if (accessKey.gasPayment.source !== 'KeyBalance')
      throw new Error('Expected a key paid from its own balance');

    return accessKey.gasPayment.balance;
  };

  it('adds a key paid from its own balance and tops it up in one transaction', async () => {
    const tx = await send('nat', [
      addAccessKey({
        publicKey: gasKeyPair.publicKey,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'KeyBalance' },
        replayProtection: { channelCount: 2 },
      }),
      topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('2') }),
    ]);

    expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries[1]).toStrictEqual({
      actionType: 'TopUpAccessKeyBalance',
      publicKey: gasKeyPair.publicKey,
      amount: expect.objectContaining({ near: '2' }),
    });

    expect((await getGasKeyBalance()).near).toBe('2');
  });

  it('tops up a key of another account', async () => {
    await send('alice', [
      topUpAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: { near: '1' } }),
    ]);

    expect((await getGasKeyBalance()).near).toBe('3');
  });

  it('withdraws from the key balance back to the account', async () => {
    const before = await client.getAccountInfo({ accountId: 'nat' });

    const tx = await send('nat', [
      withdrawAccessKeyBalance({ publicKey: gasKeyPair.publicKey, amount: near('2.5') }),
    ]);

    expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries).toStrictEqual([
      {
        actionType: 'WithdrawAccessKeyBalance',
        publicKey: gasKeyPair.publicKey,
        amount: expect.objectContaining({ near: '2.5' }),
      },
    ]);

    expect((await getGasKeyBalance()).near).toBe('0.5');

    // The account gets the whole amount and pays the transaction fee out of it
    const after = await client.getAccountInfo({ accountId: 'nat' });
    const received = after.balance.total.sub(before.balance.total);

    expect(received.gt(near('2.49'))).toBe(true);
    expect(received.lt(near('2.5'))).toBe(true);
  });
});
