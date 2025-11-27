// Client
export { createClient } from './client/createClient';
export { createTestnetClient } from './client/presets/testnet';
export { createMainnetClient } from './client/presets/mainnet';

// Key Services
export {
  createMemoryKeyService,
  safeCreateMemoryKeyService,
} from './keyServices/memoryKeyService/createMemoryKeyService';

// Signers
export { createMemorySigner } from './signers/memorySigner/createMemorySigner';

// Action Creators
export { transfer } from './helpers/actionCreators/transfer';
export { createAccount } from './helpers/actionCreators/createAccount';
export { addFullAccessKey } from './helpers/actionCreators/addFullAccessKey';
export { addFunctionCallKey } from './helpers/actionCreators/addFunctionCallKey';
export { functionCall } from './helpers/actionCreators/functionCall';
export { deleteKey } from './helpers/actionCreators/deleteKey';
export { deleteAccount } from './helpers/actionCreators/deleteAccount';
export { deployContract } from './helpers/actionCreators/deployContract';

// Helpers
export {
  near,
  yoctoNear,
  nearToken,
  isNearToken,
} from './helpers/tokens/nearToken';
export { gas, teraGas, nearGas, isNearGas } from './helpers/nearGas';

// KeyPair
export {
  safeKeyPair,
  throwableKeyPair as keyPair,
} from './helpers/keyPair/keyPair';
export {
  safeRandomEd25519KeyPair,
  throwableRandomEd25519KeyPair as randomEd25519KeyPair,
} from './helpers/keyPair/randomEd25519KeyPair';
export {
  safeRandomSecp256k1KeyPair,
  throwableRandomSecp256k1KeyPair as randomSecp256k1KeyPair,
} from './helpers/keyPair/randomSecp256k1KeyPair';

// Errors
export { isNatError } from '@common/natError';

// Types
export type { Client } from 'nat-types/client/client';
export type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService';
export type { MemorySigner } from 'nat-types/signers/memorySigner/memorySigner';
