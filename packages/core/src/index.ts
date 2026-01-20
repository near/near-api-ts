// Clients
export {
  safeCreateClient,
  throwableCreateClient as createClient,
} from './client/createClient';
export { createTestnetClient } from './client/presets/testnet';
export { createMainnetClient } from './client/presets/mainnet';

// Key Services
export {
  safeCreateMemoryKeyService,
  throwableCreateMemoryKeyService as createMemoryKeyService,
} from './keyServices/memoryKeyService/createMemoryKeyService';

// Signers
export {
  safeCreateMemorySigner,
  throwableCreateMemorySigner as createMemorySigner,
  createSafeMemorySignerFactory,
  createThrowableMemorySignerFactory as createMemorySignerFactory,
} from './signers/memorySigner/createMemorySigner';

// Action Creators
export { createAccount } from './helpers/actionCreators/createAccount';
export {
  safeTransfer,
  throwableTransfer as transfer,
} from './helpers/actionCreators/transfer';
export {
  safeAddFullAccessKey,
  throwableAddFullAccessKey as addFullAccessKey,
} from './helpers/actionCreators/addFullAccessKey';
export {
  safeAddFunctionCallKey,
  throwableAddFunctionCallKey as addFunctionCallKey,
} from './helpers/actionCreators/addFunctionCallKey';
export {
  safeFunctionCall,
  throwableFunctionCall as functionCall,
} from './helpers/actionCreators/functionCall';
export {
  safeDeployContract,
  throwableDeployContract as deployContract,
} from './helpers/actionCreators/deployContract';
export {
  safeDeleteKey,
  throwableDeleteKey as deleteKey,
} from './helpers/actionCreators/deleteKey';
export {
  safeDeleteAccount,
  throwableDeleteAccount as deleteAccount,
} from './helpers/actionCreators/deleteAccount';

// Near Token
export {
  safeNear,
  throwableNear as near,
  safeYoctoNear,
  throwableYoctoNear as yoctoNear,
  safeNearToken,
  throwableNearToken as nearToken,
  isNearToken,
} from './helpers/tokens/nearToken';

// NearGas
export {
  safeTeraGas,
  throwableTeraGas as teraGas,
  safeGas,
  throwableGas as gas,
  safeNearGas,
  throwableNearGas as nearGas,
  isNearGas,
} from './helpers/nearGas';

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
export type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
export type { MemorySigner } from 'nat-types/signers/memorySigner/memorySigner';
export type {
  SafeMemorySignerFactory,
  MemorySignerFactory,
} from 'nat-types/signers/memorySigner/createMemorySigner';
export type { AccountId } from 'nat-types/_common/common';
export type { PublicKey, PrivateKey, Signature } from 'nat-types/_common/crypto';
