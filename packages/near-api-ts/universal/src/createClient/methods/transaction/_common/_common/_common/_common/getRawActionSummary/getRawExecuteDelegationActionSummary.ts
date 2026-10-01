import type {
  AccessKeyPermission,
  AccessKeyPermissionView,
  DelegateAction,
  GasKeyInfo,
  NonDelegateAction,
} from '@near-js/jsonrpc-types';
import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import type { Base64String } from '../../../../../../../../../types/_common/common';
import type { PublicKey, Signature } from '../../../../../../../../../types/_common/crypto';
import type { DelegableActionSummary } from '../../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import { constants } from '../../../../../../../../_common/_common/_common/constants';
import { gas } from '../../../../../../../../_common/nearGas';
import { yoctoNear } from '../../../../../../../../_common/nearToken';
import { getRawAddAccessKeyActionSummary } from './_common/getRawAddAccessKeyActionSummary';

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

// TODO try to reuse some action convertors from getRawActionSummary
const convertNonDelegateActionToSummary = (
  nonDelegateAction: NonDelegateAction,
): DelegableActionSummary<Base64String> => {
  // Not the same as in getRawActionSummary
  if ('CreateAccount' in nonDelegateAction)
    return {
      actionType: 'CreateAccount',
    };

  if ('Transfer' in nonDelegateAction)
    return {
      actionType: 'Transfer' as const,
      amount: yoctoNear(nonDelegateAction.Transfer.deposit),
    };

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
      actionType: 'DeployContract' as const,
      contractWasmHash,
    };
  }

  if ('FunctionCall' in nonDelegateAction) {
    const { FunctionCall } = nonDelegateAction;
    return {
      actionType: 'FunctionCall' as const,
      functionName: FunctionCall.methodName,
      functionArgs: FunctionCall.args,
      gasLimit: gas(FunctionCall.gas),
      attachedDeposit: yoctoNear(FunctionCall.deposit),
    };
  }

  if ('Stake' in nonDelegateAction) {
    const { Stake } = nonDelegateAction;
    return {
      actionType: 'Stake' as const,
      amount: yoctoNear(Stake.stake),
      validatorPublicKey: Stake.publicKey as PublicKey, // TODO validate key by zod
    };
  }

  if ('DeleteKey' in nonDelegateAction) {
    const { DeleteKey } = nonDelegateAction;
    return {
      actionType: 'DeleteKey' as const,
      publicKey: DeleteKey.publicKey as PublicKey, // TODO validate key by zod
    };
  }

  if ('DeleteAccount' in nonDelegateAction) {
    const { DeleteAccount } = nonDelegateAction;
    return {
      actionType: 'DeleteAccount' as const,
      beneficiaryAccountId: DeleteAccount.beneficiaryId,
    };
  }

  // Not the same as in getRawActionSummary - a delegated action is the action itself, so it
  // carries the wasm and the deploy mode instead of being split into a view per mode.
  if ('DeployGlobalContract' in nonDelegateAction) {
    const { DeployGlobalContract } = nonDelegateAction;

    const contractWasmU8 = Uint8Array.fromBase64(DeployGlobalContract.code);
    const contractWasmHashU8 = sha256(contractWasmU8);
    const contractWasmHash = base58.encode(contractWasmHashU8);

    return DeployGlobalContract.deployMode === 'CodeHash'
      ? {
          actionType: 'RegisterPinnableGlobalContract' as const,
          contractWasmHash,
        }
      : {
          actionType: 'RegisterLinkableGlobalContract' as const,
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

  if ('TransferToGasKey' in nonDelegateAction) {
    const { TransferToGasKey } = nonDelegateAction;
    return {
      actionType: 'TopUpAccessKeyBalance' as const,
      publicKey: TransferToGasKey.publicKey as PublicKey, // TODO validate key by zod
      amount: yoctoNear(TransferToGasKey.deposit),
    };
  }

  if ('WithdrawFromGasKey' in nonDelegateAction) {
    const { WithdrawFromGasKey } = nonDelegateAction;
    return {
      actionType: 'WithdrawAccessKeyBalance' as const,
      publicKey: WithdrawFromGasKey.publicKey as PublicKey, // TODO validate key by zod
      amount: yoctoNear(WithdrawFromGasKey.amount),
    };
  }

  throw new Error(`Unsupported delegable action: ${JSON.stringify(nonDelegateAction)}`);
};

export const getRawExecuteDelegationActionSummary = (
  delegateAction: DelegateAction,
  signature: Signature,
) => {
  return {
    actionType: 'ExecuteDelegation' as const,
    delegation: {
      tag: constants.Nep366MetaTransaction.Tag,
      delegatorAccountId: delegateAction.senderId,
      delegatorPublicKey: delegateAction.publicKey as PublicKey,
      delegatedActionSummaries: delegateAction.actions.map(convertNonDelegateActionToSummary),
      receiverAccountId: delegateAction.receiverId,
      expiration: { blockHeight: delegateAction.maxBlockHeight },
      nonce: delegateAction.nonce,
    },
    signature: signature as Signature,
  };
};
