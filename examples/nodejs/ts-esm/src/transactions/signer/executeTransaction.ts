import {
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  testnet,
  transfer,
} from '@near-api-ts/core';
import { testKeys } from '../testKeys';

const client = createClient({ network: testnet });

// biome-ignore format: keep compact
const keyService = await createMemoryKeyService({
  keySources: [
    { privateKey: testKeys['ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9'] },
    { privateKey: testKeys['ed25519:76ajHU6SdLPEz7YwWR1Ejm3iq96RAhL3MGAkbqXyCZTv'] },
    { privateKey: testKeys['ed25519:6RrJpmSUdKgru2JT9yWWZr2Qkj5mRYEBQqnuxBtxxfEc'] },
    { privateKey: testKeys['ed25519:5JgE5tBqbtd4ghgRqu2SFjxFs1x7GonNuLhXbi4Z2pik'] },
  ],
});

const signer = await createMemorySigner({
  signerAccountId: 'nat-t1.lantstool.testnet',
  client,
  keyService,
  keyPool: {
    signingKeys: ['ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9'], // will sign only by this key
  },
});

const res = await signer.executeTransaction({
  action: transfer({ amount: { yoctoNear: '1' } }),
  receiverAccountId: 'eclipseer.testnet',
});

console.dir(res, { depth: null });
