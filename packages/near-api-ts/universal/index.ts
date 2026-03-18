import './types/_common/Uint8Array';

// Clients
export {
  safeCreateClient,
  throwableCreateClient as createClient,
} from './src/client/createClient';
export { createTestnetClient } from './src/client/presets/testnet';
export { createMainnetClient } from './src/client/presets/mainnet';

// Key Services
export {
  safeCreateMemoryKeyService,
  throwableCreateMemoryKeyService as createMemoryKeyService,
} from './src/keyServices/memoryKeyService/createMemoryKeyService';

// Signers
export {
  safeCreateMemorySigner,
  throwableCreateMemorySigner as createMemorySigner,
  createSafeMemorySignerFactory,
  createThrowableMemorySignerFactory as createMemorySignerFactory,
} from './src/signers/memorySigner/createMemorySigner';

// Action Creators
export { createAccount } from './src/helpers/actionCreators/createAccount';
export {
  safeTransfer,
  throwableTransfer as transfer,
} from './src/helpers/actionCreators/transfer';
export {
  safeAddFullAccessKey,
  throwableAddFullAccessKey as addFullAccessKey,
} from './src/helpers/actionCreators/addFullAccessKey';
export {
  safeAddFunctionCallKey,
  throwableAddFunctionCallKey as addFunctionCallKey,
} from './src/helpers/actionCreators/addFunctionCallKey';
export {
  safeFunctionCall,
  throwableFunctionCall as functionCall,
} from './src/helpers/actionCreators/functionCall';
export {
  safeDeployContract,
  throwableDeployContract as deployContract,
} from './src/helpers/actionCreators/deployContract';
export {
  safeStake,
  throwableStake as stake,
} from './src/helpers/actionCreators/stake';
export {
  safeDeleteKey,
  throwableDeleteKey as deleteKey,
} from './src/helpers/actionCreators/deleteKey';
export {
  safeDeleteAccount,
  throwableDeleteAccount as deleteAccount,
} from './src/helpers/actionCreators/deleteAccount';

export { safeCreateMessage, createMessage } from './src/helpers/message/createMessage';
export { safeVerifyMessage, verifyMessage } from './src/helpers/message/verifyMessage';
export { safeVerifySignature, verifySignature } from './src/helpers/verifySignature';

// Near Token
export {
  safeNear,
  throwableNear as near,
  safeYoctoNear,
  throwableYoctoNear as yoctoNear,
  safeNearToken,
  throwableNearToken as nearToken,
  isNearToken,
} from './src/helpers/tokens/nearToken';

// NearGas
export {
  safeTeraGas,
  throwableTeraGas as teraGas,
  safeGas,
  throwableGas as gas,
  safeNearGas,
  throwableNearGas as nearGas,
  isNearGas,
} from './src/helpers/nearGas';

// KeyPair
export {
  safeKeyPair,
  throwableKeyPair as keyPair,
} from './src/helpers/keyPair/keyPair';
export {
  safeRandomEd25519KeyPair,
  randomEd25519KeyPair,
} from './src/helpers/keyPair/randomEd25519KeyPair';
export {
  safeRandomSecp256k1KeyPair,
  randomSecp256k1KeyPair,
} from './src/helpers/keyPair/randomSecp256k1KeyPair';

// Errors
export { isNatError } from './src/_common/natError';

// Utils
export { toJsonBytes, fromJsonBytes } from './src/_common/utils/common';
export {
  toEd25519CurveString,
  toSecp256k1CurveString,
} from './src/_common/transformers/toCurveString';

// Types

// Client
export type { Client } from './types/client/client';

export type {
  GetAccountInfo,
  SafeGetAccountInfo,
  GetAccountInfoOutput,
  GetAccountInfoError,
} from './types/client/methods/account/getAccountInfo';

export type {
  CallContractReadFunction,
  SafeCallContractReadFunction,
  CallContractReadFunctionOutput,
  CallContractReadFunctionError,
  BaseSerializeArgsFn,
  MaybeBaseSerializeArgsFn,
  BaseDeserializeResultFn,
  DeserializeResultFnArgs,
  MaybeBaseDeserializeResultFn,
} from './types/client/methods/contract/callContractReadFunction';

export type { MemoryKeyService } from './types/keyServices/memoryKeyService/memoryKeyService';
export type { MemorySigner } from './types/signers/memorySigner/memorySigner';
export type {
  SafeMemorySignerFactory,
  MemorySignerFactory,
} from './types/signers/memorySigner/public/createMemorySigner';

export type {
  PublicKey,
  PrivateKey,
  Signature,
} from './types/_common/crypto';

export type {
  Transaction,
  TransactionIntent,
  Action,
  SignedTransaction,
} from './types/_common/transaction/transaction';

export type { TransferAction } from './types/_common/transaction/actions/transfer';
export type { FunctionCallAction } from './types/_common/transaction/actions/functionCall';

export type { Message, SignedMessage } from './types/_common/message';

export type {
  AccountId,
  BlockReference,
  JsonValue,
  MaybeJsonValue,
  ContractFunctionName,
} from './types/_common/common';

export type { PartialTransportPolicy } from './types/client/transport/transport';

// Zod Schemas
export { AccountIdSchema } from './src/_common/schemas/zod/common/accountId';
export { PublicKeySchema } from './src/_common/schemas/zod/common/publicKey';
export { Base64StringSchema } from './src/_common/schemas/zod/common/base64String';
