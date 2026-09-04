import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import { type Client, functionCall, keyPair, pinGlobalContract } from '../../../../index';
import { signTransaction } from '../../../../src/transaction/signTransaction/signTransaction';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { publishPinnableGlobalContract } from './_common/publishGlobalContract';

describe('signAndSendTransaction › success', () => {
  let client: Client;
  const defaultKeyPair = keyPair(DEFAULT_PRIVATE_KEY);

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('pins code registered under its wasm hash and runs it', async () => {
    const { globalContractWasmHash } = await publishPinnableGlobalContract({
      client,
      registrarAccountId: 'nat',
      registrarKeyPair: defaultKeyPair,
    });

    const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
      accountId: 'alice',
      publicKey: defaultKeyPair.publicKey,
    });

    // Pinning acts on the signer's own account, so the transaction is self-addressed. The function
    // call in the same transaction proves the pinned code is live right away.
    const signedTransaction = await signTransaction({
      signDataProvider: defaultKeyPair,
      transaction: {
        signerAccountId: 'alice',
        signerPublicKey: defaultKeyPair.publicKey,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        actions: [
          pinGlobalContract({ globalContractWasmHash }),
          functionCall({
            functionName: 'write_record',
            functionArgs: { record_id: 0, record: 'Hello' },
            gasLimit: { teraGas: '100' },
          }),
        ],
        receiverAccountId: 'alice',
      },
    });

    const tx = await client.sendSignedTransaction({
      signedTransaction,
      minimalProcessingStage: 'ExecutedNearlyFinal',
    });

    expect(tx.processingSteps.conversionStep.transactionSummary.actionSummaries).toMatchObject([
      { actionType: 'PinGlobalContract', globalContractWasmHash },
      { actionType: 'FunctionCall', functionName: 'write_record' },
    ]);

    // A pinned account is tied to one exact wasm, so it carries the hash rather than the account
    // id the code was registered from.
    const { contract } = await client.getAccountInfo({ accountId: 'alice' });

    expect(contract).toStrictEqual({ status: 'Pinned', globalContractWasmHash });

    const { result } = await client.callContractReadFunction({
      contractAccountId: 'alice',
      functionName: 'get_record',
      functionArgs: { record_id: 0 },
    });

    expect(result).toBe('Hello');
  });
});
