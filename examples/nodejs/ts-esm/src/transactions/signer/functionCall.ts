import {
  createClient,
  createMemoryKeyService,
  testnet,
  createMemorySigner,
  functionCall,
} from '@near-api-ts/core';
import { testKeys } from '../testKeys';

const client = createClient({ network: testnet });

const keyService = await createMemoryKeyService({
  keySource: {
    privateKey:
      testKeys['ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9'],
  },
});

const signer = await createMemorySigner({
  signerAccountId: 'nat-t1.lantstool.testnet',
  client,
  keyService,
});

const res = await signer.executeTransaction({
  action: functionCall({
    functionName: 'write_record',
    fnArgsJson: {
      record_id: 0,
      record: 'Hey',
    },
    gasLimit: { teraGas: '50' },
  }),
  receiverAccountId: 'test.lantstool.testnet',
});

console.dir(res, { depth: null });
