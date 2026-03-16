'use client';
// Lib
export { useAccountInfo } from './hooks/useAccountInfo.ts';
export { useConnectedAccount } from './hooks/useConnectedAccount.ts';
export { useContractReadFunction } from './hooks/useContractReadFunction.ts';
export { useExecuteTransaction } from './hooks/useExecuteTransaction.ts';
export { useSignMessage } from './hooks/useSignMessage.ts';
export { useNearConnector } from './hooks/useNearConnector.ts';
export { MainnetNearProvider } from './providers/MainnetNearProvider.tsx';
export { NearProvider } from './providers/NearProvider.tsx';
export { TestnetNearProvider } from './providers/TestnetNearProdiver.tsx';
export { createNearStore } from './store/nearStore.ts';
export { createNearConnectorService } from './services/nearConnector/nearConnector.ts';

// near-api-ts reexports
export {
  createTestnetClient,
  createMainnetClient,
  createClient,
  // actionCreators
  createAccount,
  transfer,
  addFullAccessKey,
  addFunctionCallKey,
  functionCall,
  deployContract,
  stake,
  deleteKey,
  deleteAccount,
  //utils
  keyPair,
  randomEd25519KeyPair,
  randomSecp256k1KeyPair,
  nearToken,
  near,
  yoctoNear,
  nearGas,
  gas,
  teraGas,
  fromJsonBytes,
  toJsonBytes,
} from 'near-api-ts';

export type { DeserializeResultFnArgs } from 'near-api-ts';
