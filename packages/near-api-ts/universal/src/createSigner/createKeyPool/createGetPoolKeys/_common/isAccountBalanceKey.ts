import type {
  AccessKey,
  AccountBalanceContractFunctionCallKey,
  AccountBalanceFullAccessKey,
} from '../../../../../types/_common/accessKey';

// A signer never signs by a gas key - a key that pays for gas from its own balance. A key paid
// from the account balance keeps a single nonce channel, the one the pool tracks for it
export const isAccountBalanceKey = (
  key: AccessKey,
): key is AccountBalanceFullAccessKey | AccountBalanceContractFunctionCallKey =>
  key.gasPayment.source === 'AccountBalance';
