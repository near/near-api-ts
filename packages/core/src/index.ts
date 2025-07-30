export { createClient } from './client/createClient/createClient';
export { testnet } from './client/presets/networks';
export { createMemoryKeyService } from './keyServices/memoryKeyService/createMemoryKeyService';
export { transfer } from './common/actions/transfer';

export {
  addEd25519FullAccessKey,
  addSecp256k1FullAccessKey,
} from './common/actions/addKey';

// import { b } from "@zorsh/zorsh"
//
// const schema = b.array(b.u8(), 32);
// const x = new Uint8Array([1, 2, 2]);
// schema.serialize(x)
