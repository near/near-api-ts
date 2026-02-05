import {
  createTestnetClient,
  createMemoryKeyService,
  createMemorySigner,
  transfer,
  near,
  isNatError,
} from '@near-api-ts/core';

// Read some data from the chain
const client = createTestnetClient();

const { accountInfo } = await client.getAccountInfo({
  accountId: 'testnet',
  atMomentOf: 'LatestFinalBlock',
});
console.log('Near:', accountInfo.balance.total.near);
console.log('YoctoNear:', accountInfo.balance.total.yoctoNear);

// Send some transaction
const keyService = createMemoryKeyService({
  keySource: { privateKey: 'ed25519:your-private-key' },
});

const signer = createMemorySigner({
  signerAccountId: 'your-account.testnet',
  client,
  keyService,
});

await signer.executeTransaction({
  intent: {
    action: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'some-receiver.testnet',
  },
});

// Handle transaction errors
try {
  const txResult = await signer.executeTransaction({
    intent: {
      action: transfer({ amount: near('10000000000') }),
      receiverAccountId: 'some-receiver.testnet',
    },
  });
} catch (e) {
  if (
    isNatError(
      e,
      'MemorySigner.ExecuteTransaction.Rpc.Transaction.Signer.Balance.TooLow',
    )
  ) {
    console.log(e.context.transactionCost);
  }
}

// Use library functions in 'safe' mode
const maybeBlock = await client.safeGetBlock({
  blockReference: { blockHeight: 10000000000000 },
});
console.log(maybeBlock); // { ok: false, error: NatError: <{ kind: 'Client.GetBlock.Rpc.Block.NotFound', context: null }> }
