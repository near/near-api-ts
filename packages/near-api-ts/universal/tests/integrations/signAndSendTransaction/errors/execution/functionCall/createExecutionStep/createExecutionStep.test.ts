import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  addFullAccessKey,
  deployContract,
  functionCall,
  transfer,
} from '../../../../../../../index';
import { safeSleep } from '../../../../../../../src/_common/utils/sleep';
import { createAccount } from '../../../../../../../src/helpers/actionCreators/createAccount';
import { keyPair } from '../../../../../../../src/helpers/keyPairs/keyPair/keyPair';
import { signTransaction } from '../../../../../../../src/helpers/signTransaction';
import type { KeyPair } from '../../../../../../../types/_common/keyPairs/keyPair';
import type { Client } from '../../../../../../../types/client/client';
import { assertTxResultExecutionErrKind } from '../../../../../../utils/assertTxResultExecutionErrKind';
import { createDefaultClient, log } from '../../../../../../utils/common';
import { startSandbox } from '../../../../../../utils/sandbox/startSandbox';
import { invalidDeleteAccountActionPosition } from './invalidDeleteAccountActionPosition';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › FunctionCall.* errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);

    // Prepare contract
    const wasmBytes = new Uint8Array(
      await readFile(
        path.join(
          path.dirname(fileURLToPath(import.meta.url)),
          './contract/wasm/contract_with_errors.wasm',
        ),
      ),
    );

    const { accountAccessKey, blockHash } = await context.client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await signTransaction({
      signDataProvider: context.defaultKeyPair,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: accountAccessKey.nonce + 1,
        blockHash,
        actions: [
          createAccount(),
          transfer({ amount: { near: '10' } }),
          addFullAccessKey(context.defaultKeyPair),
          deployContract({ wasmBytes }),
        ],
        receiverAccountId: 'contract.nat',
      },
    });
    await context.client.safeSendSignedTransaction({ signedTransaction });

    return () => sandbox.stop();
  });

  it('return invalidDeleteAccountActionPosition', invalidDeleteAccountActionPosition(context));
});
