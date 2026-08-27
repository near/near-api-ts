import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  type Client,
  createAccount,
  deployContract,
  executeDelegation,
  functionCall,
  keyPair,
  near,
  signDelegation,
  signTransaction,
  transfer,
} from '../../index';
import { createDefaultClient, getFileBytes, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

describe('Execute delegation', () => {
  let client: Client;

  const aliceKp = keyPair(DEFAULT_PRIVATE_KEY);
  const relayKp = keyPair(
    'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6',
  );

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('test', async () => {
    // #1: alice signs the delegation. The delegated action is a plain function
    // call, and the delegation receiver is the contract - not the relay.
    const aliceAccessKey = await client.getAccountAccessKey({
      accountId: 'alice',
      publicKey: aliceKp.publicKey,
    });

    const signedDelegation = await signDelegation({
      delegation: {
        delegatorAccountId: 'alice',
        delegatorPublicKey: aliceKp.publicKey,
        delegatedActions: [
          createAccount(),
          transfer({ amount: near('50') }),
          deployContract({ wasmBytes: await getFileBytes('./wasm/write-get-record.wasm') }),
          functionCall({
            functionName: 'write_record',
            functionArgs: { record_id: 1, record: 'Hi Alice' },
            gasLimit: { teraGas: '20' },
          }),
          functionCall({
            functionName: 'write_record',
            functionArgs: { record_id: 2, record: 'Hello Again!' },
            gasLimit: { teraGas: '30' },
          }),
        ],
        receiverAccountId: 'contract.alice',
        nonce: aliceAccessKey.accountAccessKey.nonce + 1,
        expiration: { blockHeight: aliceAccessKey.blockHeight + 100 },
      },
      signDataProvider: aliceKp,
    });

    // #2: The relay wraps the signed delegation into its own transaction. The
    // transaction receiver must be the delegator, or the node answers with
    // DelegateActionSenderDoesNotMatchTxReceiver.
    const relayAccessKey = await client.getAccountAccessKey({
      accountId: 'relay',
      publicKey: relayKp.publicKey,
    });

    const signedTransaction = await signTransaction({
      transaction: {
        signerAccountId: 'relay',
        signerPublicKey: relayKp.publicKey,
        nonce: relayAccessKey.accountAccessKey.nonce + 1,
        actions: [executeDelegation(signedDelegation), transfer({ amount: { near: '1' } })],
        receiverAccountId: 'alice',
        blockHash: relayAccessKey.blockHash,
      },
      signDataProvider: relayKp,
    });

    const txResult = await client.safeSendSignedTransaction({
      signedTransaction,
      minimalProcessingStage: 'CompletedFinal',
    });

    log(txResult);
  });
});
