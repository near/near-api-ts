import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createMemoryKeyVault,
  createMemorySigner,
  deleteAccount,
  type MemoryKeyVault,
  transfer,
} from '../../../../../../index';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

describe('executeTransaction › Transaction.Receiver.NotFound', () => {
  let client: Client;
  let keyVault: MemoryKeyVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyVault = createMemoryKeyVault({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });
    return () => sandbox.stop();
  });

  // it('fails with Transaction.Receiver.NotFound when transferring to a missing account', async () => {
  //   const nat = createMemorySigner({ signerAccountId: 'nat', client, keyVault });
  //
  //   const tx = await nat.safeExecuteTransaction({
  //     intent: {
  //       action: transfer({ amount: { near: '1' } }),
  //       receiverAccountId: 'not-bob',
  //     },
  //   });
  //   assertNatErrKind(tx, 'MemorySigner.ExecuteTransaction.Rpc.Transaction.Receiver.NotFound');
  // });

  // it('fails with Transaction.Receiver.NotFound when deleting a missing account', async () => {
  //   const nat = createMemorySigner({ signerAccountId: 'nat', client, keyVault });
  //
  //   const tx = await nat.safeExecuteTransaction({
  //     intent: {
  //       action: deleteAccount({ beneficiaryAccountId: 'bob' }),
  //       receiverAccountId: 'not-bob',
  //     },
  //   });
  //   assertNatErrKind(tx, 'MemorySigner.ExecuteTransaction.Rpc.Transaction.Receiver.NotFound');
  // });
});
