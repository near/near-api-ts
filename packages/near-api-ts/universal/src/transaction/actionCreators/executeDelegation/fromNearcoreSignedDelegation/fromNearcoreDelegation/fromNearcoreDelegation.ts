import { base58 } from '@scure/base';
import type {
  DelegableAction,
  DelegationReplayProtection,
  NearcoreDelegableAction,
  NearcoreDelegationV1,
  NearcoreDelegationV2,
  SignedDelegation,
} from '../../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import type { NearcoreTransactionNonce } from '../../../../../../types/_common/transaction/transaction';
import { constants } from '../../../../../_common/_common/_common/constants';
import { fromNearcorePublicKey } from './_common/fromNearcorePublicKey';
import { fromNearcoreAddAccessKeyAction } from './fromNearcoreAddAccessKeyAction';
import { fromNearcoreFunctionCallAction } from './fromNearcoreFunctionCallAction';

// Borsh deserializes `u8` arrays into plain number arrays, not Uint8Array.
const fromNearcoreDelegableAction = (action: NearcoreDelegableAction): DelegableAction => {
  if ('createAccount' in action) return { actionType: 'CreateAccount' };

  if ('transfer' in action)
    return { actionType: 'Transfer', amount: { yoctoNear: action.transfer.deposit } };

  if ('deployContract' in action)
    return { actionType: 'DeployContract', wasmU8: Uint8Array.from(action.deployContract.code) };

  if ('functionCall' in action) return fromNearcoreFunctionCallAction(action.functionCall);

  if ('stake' in action)
    return {
      actionType: 'Stake',
      amount: { yoctoNear: action.stake.stake },
      validatorPublicKey: fromNearcorePublicKey(action.stake.publicKey),
    };

  if ('addKey' in action) return fromNearcoreAddAccessKeyAction(action.addKey);

  if ('deleteKey' in action)
    return {
      actionType: 'DeleteKey',
      publicKey: fromNearcorePublicKey(action.deleteKey.publicKey),
    };

  if ('deleteAccount' in action)
    return {
      actionType: 'DeleteAccount',
      beneficiaryAccountId: action.deleteAccount.beneficiaryId,
    };

  if ('deployGlobalContract' in action) {
    const { code, deployMode } = action.deployGlobalContract;
    const wasmU8 = Uint8Array.from(code);

    return 'codeHash' in deployMode
      ? {
          actionType: 'RegisterPinnableGlobalContract',
          wasmU8,
        }
      : {
          actionType: 'RegisterLinkableGlobalContract',
          wasmU8,
        };
  }

  // Nearcore has one `UseGlobalContract` action, so the identifier it carries is what tells our
  // two actions apart - the same split `toNearcorePinGlobalContractAction` and
  // `toNearcoreLinkGlobalContractAction` make in the other direction.
  if ('useGlobalContract' in action) {
    const { contractIdentifier } = action.useGlobalContract;

    return 'codeHash' in contractIdentifier
      ? {
          actionType: 'PinGlobalContract',
          globalContractWasmHash: base58.encode(Uint8Array.from(contractIdentifier.codeHash)),
        }
      : {
          actionType: 'LinkGlobalContract',
          globalContractAccountId: contractIdentifier.accountId,
        };
  }

  if ('transferToGasKey' in action)
    return {
      actionType: 'TopUpAccessKeyBalance',
      publicKey: fromNearcorePublicKey(action.transferToGasKey.publicKey),
      amount: { yoctoNear: action.transferToGasKey.deposit },
    };

  if ('withdrawFromGasKey' in action)
    return {
      actionType: 'WithdrawAccessKeyBalance',
      publicKey: fromNearcorePublicKey(action.withdrawFromGasKey.publicKey),
      amount: { yoctoNear: action.withdrawFromGasKey.amount },
    };

  // A delegation can carry an action this library cannot represent (ExecuteDelegation) only if
  // it was created outside of it.
  throw new Error('Unsupported delegable action', { cause: action });
};

export type WireDelegation = Omit<NearcoreDelegationV1, 'tag'> | Omit<NearcoreDelegationV2, 'tag'>;

const fromNearcoreTransactionNonce = (
  nonce: NearcoreTransactionNonce,
): DelegationReplayProtection =>
  'gasKeyNonce' in nonce
    ? {
        scheme: 'NonceChannels',
        nonceChannelId: nonce.gasKeyNonce.nonceIndex,
        nonce: Number(nonce.gasKeyNonce.nonce),
      }
    : { scheme: 'NonceChannel', nonce: Number(nonce.nonce.nonce) };

// Only a NEP-611 delegation has `version` - the discriminant of its payload.
export const fromNearcoreDelegation = (
  delegation: WireDelegation,
): SignedDelegation['delegation'] => {
  const isNep611 = 'version' in delegation;

  return {
    tag: isNep611 ? constants.Delegation.Nep611Tag : constants.Delegation.Nep366Tag,
    delegator: {
      accountId: delegation.senderId,
      publicKey: fromNearcorePublicKey(delegation.publicKey),
      replayProtection: isNep611
        ? fromNearcoreTransactionNonce(delegation.nonce)
        : { scheme: 'NonceChannel', nonce: Number(delegation.nonce) },
    },
    receiverAccountId: delegation.receiverId,
    expiration: { blockHeight: Number(delegation.maxBlockHeight) },
    delegatedActions: delegation.actions.map(fromNearcoreDelegableAction),
  };
};
