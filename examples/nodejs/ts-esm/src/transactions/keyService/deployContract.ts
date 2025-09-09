import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createClient,
  createMemoryKeyService,
  testnet,
  createAccount,
  transfer,
  addFullAccessKey,
  deployContract,
  functionCall,
} from '@near-api-ts/core';

// Get wasm file
const ftWasmBytes = await readFile(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../wasm/fungible_token.wasm',
  ),
);

const client = createClient({ network: testnet });

const signerAccountId = 'nat-t1.lantstool.testnet';
const newAccountId = 'ft.nat-t1.lantstool.testnet';
const signerPublicKey = 'ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9';
const signerPrivateKey =
  'ed25519:5yH12pq5HsTpE8GDrvwePNHhZHm8ENkKwjkgvMwwVpR3ZWjG46EqFMKbjZA2deRvLrGK19Jjybj5N3tQQirZoSpB';

const keyService = await createMemoryKeyService({
  keySource: { privateKey: signerPrivateKey },
});

const {
  accountKey: { nonce },
  blockHash,
} = await client.getAccountKey({
  accountId: signerAccountId,
  publicKey: signerPublicKey,
});

const signedTransaction = await keyService.signTransaction({
  signerAccountId,
  signerPublicKey: signerPublicKey,
  actions: [
    createAccount(),
    transfer({ amount: { near: '3.5' } }),
    addFullAccessKey({ publicKey: signerPublicKey }),
    deployContract({ wasmBytes: ftWasmBytes }),
    functionCall({
      fnName: 'new_default_meta',
      fnArgsJson: {
        owner_id: signerAccountId,
        total_supply: '1000',
      },
      gasLimit: { teraGas: '50' },
    }),
  ],
  receiverAccountId: newAccountId,
  nonce: nonce + 1,
  blockHash,
});

console.log(signedTransaction);
const result = await client.sendSignedTransaction({ signedTransaction });
console.log(result);
