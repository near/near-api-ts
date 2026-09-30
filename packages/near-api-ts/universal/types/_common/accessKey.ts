import type { AccountId, ContractFunctionName, SequentialNonce } from './common';
import type { PublicKeyRef } from './crypto';
import type { NearToken, NearTokenArgs } from './nearToken';

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

export type GasBudgetArgs = 'Unlimited' | NearTokenArgs;
export type GasBudget = 'Unlimited' | NearToken;
/**
 * The set of contract functions this function-call key is permitted to invoke.
 * - `'AllNonPayable'` — the key may call any non-payable function on the contract.
 * - {@link ContractFunctionName}[] — restricts the key to an explicit list of functions.
 *   Each name has a max length limit, and so does the list as a whole — see protocol config.
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

export type FullAccessPermission = {
  kind: 'FullAccess';
};

export type FunctionCallPermission = {
  kind: 'FunctionCall';
  allowedContract: AccountId;
  allowedFunctions: AllowedFunctions;
};

/**
 * The key pays for gas from the account balance, as much as the account holds.
 */
type UnlimitedAccountBalanceGasPayment = {
  source: 'AccountBalance';
  allowance: 'Unlimited';
};

/**
 * The key pays for gas from the account balance: as much as the account holds when
 * `allowance` is `'Unlimited'`, otherwise no more than `allowance` — the amount it has left.
 */
type AccountBalanceGasPayment = {
  source: 'AccountBalance';
  allowance: 'Unlimited' | NearToken;
};

/**
 * The key pays for gas from its own balance, which is funded by a
 * `TransferToGasKey` action. Nearcore calls such a key a gas key.
 */
type KeyBalanceGasPayment = {
  source: 'KeyBalance';
  balance: NearToken;
};

/**
 * The key keeps a single nonce channel: every transaction it signs must use a nonce
 * greater than `lastNonce`.
 */
type NonceChannel = {
  scheme: 'NonceChannel';
  lastNonce: SequentialNonce;
};

/**
 * The key keeps `channelCount` (1..1024) independent nonce channels, so it can sign
 * that many transactions in parallel. Each transaction picks one channel and must use
 * a nonce greater than the last one in it.
 */
type NonceChannels = {
  scheme: 'NonceChannels';
  channelCount: number;
};

// ── Paid from the account balance ────────────────────────────

export type AccountBalanceFullAccessKey = {
  publicKeyRef: PublicKeyRef;
  permission: FullAccessPermission;
  gasPayment: UnlimitedAccountBalanceGasPayment;
  replayProtection: NonceChannel;
};

export type AccountBalanceFunctionCallKey = {
  publicKeyRef: PublicKeyRef;
  permission: FunctionCallPermission;
  gasPayment: AccountBalanceGasPayment;
  replayProtection: NonceChannel;
};

// ── Paid from the key balance ────────────────────────────────

export type KeyBalanceFullAccessKey = {
  publicKeyRef: PublicKeyRef;
  permission: FullAccessPermission;
  gasPayment: KeyBalanceGasPayment;
  replayProtection: NonceChannels;
};

export type KeyBalanceFunctionCallKey = {
  publicKeyRef: PublicKeyRef;
  permission: FunctionCallPermission;
  gasPayment: KeyBalanceGasPayment;
  replayProtection: NonceChannels;
};

export type AccessKey =
  | AccountBalanceFullAccessKey
  | AccountBalanceFunctionCallKey
  | KeyBalanceFullAccessKey
  | KeyBalanceFunctionCallKey;
