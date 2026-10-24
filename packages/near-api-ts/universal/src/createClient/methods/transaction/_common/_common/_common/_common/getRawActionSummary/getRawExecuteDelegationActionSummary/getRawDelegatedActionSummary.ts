import type {
  AccessKeyPermission,
  AccessKeyPermissionView,
  GasKeyInfo,
  NonDelegateAction,
} from '@near-js/jsonrpc-types';
import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import type { Base64String } from '../../../../../../../../../../types/_common/common';
import type { PublicKey } from '../../../../../../../../../../types/_common/crypto';
import type { DelegatedActionSummary } from '../../../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import type { ProtocolEra } from '../../../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import { gas } from '../../../../../../../../../_common/nearGas';
import { yoctoNear } from '../../../../../../../../../_common/nearToken';
import { getRawAddAccessKeyActionSummary } from '../_common/getRawAddAccessKeyActionSummary';
import { getRawCallContractFunctionActionSummary } from '../_common/getRawCallContractFunctionActionSummary';
import { getRawDeleteAccessKeyActionSummary } from '../_common/getRawDeleteAccessKeyActionSummary';
import { getRawDeleteAccountActionSummary } from '../_common/getRawDeleteAccountActionSummary';
import { getRawStakeActionSummary } from '../_common/getRawStakeActionSummary';
import { getRawTopUpAccessKeyBalanceActionSummary } from '../_common/getRawTopUpAccessKeyBalanceActionSummary';
import { getRawTransferActionSummary } from '../_common/getRawTransferActionSummary';

// Inside a delegation nearcore reports its own AccessKeyPermission rather than the view. They differ
// in one variant only: GasKeyFunctionCall is a tuple there - the gas key info, then the function
// call permission - which the view flattens into one object.
const toAccessKeyPermissionView = (permission: AccessKeyPermission): AccessKeyPermissionView => {
  if (typeof permission === 'object' && 'GasKeyFunctionCall' in permission) {
    const [gasKeyInfo, functionCallPermission] = permission.GasKeyFunctionCall as [
      GasKeyInfo,
      Extract<AccessKeyPermissionView, { FunctionCall: unknown }>['FunctionCall'],
    ];

    return { GasKeyFunctionCall: { ...gasKeyInfo, ...functionCallPermission } };
  }

  return permission;
};

// Where nearcore reports an action inside a delegation the way it reports it outside one, the
// converter is shared with getRawActionSummary. The others differ - each is marked below.
export const getRawDelegatedActionSummary = (
  nonDelegateAction: NonDelegateAction,
  protocolEras: readonly ProtocolEra[],
): DelegatedActionSummary<'Live' | 'Legacy', Base64String> => {
  // Not the same as in getRawActionSummary
  if ('CreateAccount' in nonDelegateAction)
    return {
      actionType: 'CreateSubAccount',
    };

  if ('Transfer' in nonDelegateAction)
    return getRawTransferActionSummary(nonDelegateAction.Transfer);

  if ('AddKey' in nonDelegateAction) {
    const { publicKey, accessKey } = nonDelegateAction.AddKey;

    return getRawAddAccessKeyActionSummary({
      publicKey,
      accessKey: { ...accessKey, permission: toAccessKeyPermissionView(accessKey.permission) },
    });
  }

  // Not the same as in getRawActionSummary
  if ('DeployContract' in nonDelegateAction) {
    const { DeployContract } = nonDelegateAction;

    const contractWasmU8 = Uint8Array.fromBase64(DeployContract.code);
    const contractWasmHashU8 = sha256(contractWasmU8);
    const contractWasmHash = base58.encode(contractWasmHashU8);

    return {
      actionType: 'DeployLocalContract' as const,
      contractWasmHash,
    };
  }

  if ('FunctionCall' in nonDelegateAction)
    return getRawCallContractFunctionActionSummary(nonDelegateAction.FunctionCall);

  if ('Stake' in nonDelegateAction) return getRawStakeActionSummary(nonDelegateAction.Stake);

  if ('DeleteKey' in nonDelegateAction)
    return getRawDeleteAccessKeyActionSummary(nonDelegateAction.DeleteKey);

  if ('DeleteAccount' in nonDelegateAction)
    return getRawDeleteAccountActionSummary(nonDelegateAction.DeleteAccount);

  // Not the same as in getRawActionSummary - a delegated action is the action itself, so it
  // carries the wasm and the deploy mode instead of being split into a view per mode.
  if ('DeployGlobalContract' in nonDelegateAction) {
    const { DeployGlobalContract } = nonDelegateAction;

    const contractWasmU8 = Uint8Array.fromBase64(DeployGlobalContract.code);
    const contractWasmHashU8 = sha256(contractWasmU8);
    const contractWasmHash = base58.encode(contractWasmHashU8);

    return DeployGlobalContract.deployMode === 'CodeHash'
      ? {
          actionType: 'PublishPinnableGlobalContract' as const,
          contractWasmHash,
        }
      : {
          actionType: 'PublishLinkableGlobalContract' as const,
          contractWasmHash,
        };
  }

  // Not the same as in getRawActionSummary - the contract identifier is a field here rather than
  // the variant itself, but it tells our two actions apart the same way.
  if ('UseGlobalContract' in nonDelegateAction) {
    const { contractIdentifier } = nonDelegateAction.UseGlobalContract;

    return 'hash' in contractIdentifier
      ? {
          actionType: 'PinGlobalContract' as const,
          globalContractWasmHash: contractIdentifier.hash,
        }
      : {
          actionType: 'LinkGlobalContract' as const,
          globalContractAccountId: contractIdentifier.accountId,
        };
  }

  if ('TransferToGasKey' in nonDelegateAction)
    return getRawTopUpAccessKeyBalanceActionSummary(nonDelegateAction.TransferToGasKey);

  if ('WithdrawFromGasKey' in nonDelegateAction) {
    if (!protocolEras.includes('Legacy'))
      throw new Error('Protocol 87 refuses a withdrawal from a key balance inside a delegation');

    const { WithdrawFromGasKey } = nonDelegateAction;
    return {
      actionType: 'LegacyWithdrawAccessKeyBalance' as const,
      publicKey: WithdrawFromGasKey.publicKey as PublicKey, // TODO validate key by zod
      amount: yoctoNear(WithdrawFromGasKey.amount),
    };
  }

  throw new Error(`Unsupported delegable action: ${JSON.stringify(nonDelegateAction)}`);
};
