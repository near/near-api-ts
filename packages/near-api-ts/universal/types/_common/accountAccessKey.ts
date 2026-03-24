import type { AccountId, ContractFunctionName, Nonce } from './common';
import type { PublicKey } from './crypto';
import type { NearTokenArgs } from './nearToken';

export type FullAccessKey = {
  accessType: 'FullAccess';
  publicKey: PublicKey;
  nonce: Nonce;
};

/**
 * The maximum number of NEAR tokens a function-call key
 * is permitted to spend on gas across all non-payable function call transactions it signs.
 *
 * - `'Unlimited'` — no spending cap is enforced.
 *
 * - {@link NearTokenArgs} — caps total gas spending at the specified amount. Each time
 *   the key is used, both the account balance and the `gasBudget` are decreased by the
 *   same value. Once exhausted, the key can no longer sign transactions.
 *
 * To increase the `gasBudget`, the key must be deleted and re-created with a new value.
 *
 * Corresponds to the `allowance` field in the protocol's `FunctionCallPermission` structure.
 * - `gasBudget: 'Unlimited'` -> `allowance?: null`
 * - `gasBudget: { near: '0.25' }` -> `allowance: '250000000000000000000000'`
 * - `gasBudget: { yoctoNear: '1000' }` -> `allowance: '1000'`
 *
 * @see {@link https://nomicon.io/DataStructures/AccessKey.html | Nomicon — Access Keys}
 */
export type GasBudget = 'Unlimited' | NearTokenArgs;

/**
 * The set of contract functions this function-call key is permitted to invoke.
 * - `'AllNonPayable'` — the key may call any non-payable function on the contract.
 * - {@link ContractFunctionName}[] — restricts the key to an explicit list of functions.
 *   Each name is limited to {@link ContractFunctionName 256 characters}.
 *
 *  The function list cannot be updated after the key is created. To change it, the key
 *  must be deleted and re-created with a new list.
 *
 *  Corresponds to the `method_names` field in the protocol's `FunctionCallPermission` structure.
 *  - `allowedFunctions: 'AllNonPayable'` -> `method_names: []`
 *  - `allowedFunctions: ['add_record']` -> `method_names: ['add_record']`
 *
 * @see {@link https://nomicon.io/DataStructures/AccessKey.html | Nomicon — Access Keys}
 */
export type AllowedFunctions = 'AllNonPayable' | ContractFunctionName[];

export type FunctionCallKey = {
  accessType: 'FunctionCall';
  publicKey: PublicKey;
  nonce: Nonce;
  contractAccountId: AccountId;
  gasBudget: GasBudget;
  allowedFunctions: AllowedFunctions;
};

export type AccountAccessKey = FullAccessKey | FunctionCallKey;
