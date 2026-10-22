import { base58 } from '@scure/base';
import type {
  DelegableAction,
  NearcoreDelegableAction,
  NearcoreDelegation,
  SignedDelegation,
} from '../../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { constants } from '../../../../../_common/_common/_common/constants';
import { fromNearcorePublicKey } from './_common/fromNearcorePublicKey';
import { fromNearcoreAddAccessKeyAction } from './fromNearcoreAddAccessKeyAction';
import { fromNearcoreCallContractFunctionAction } from './fromNearcoreCallContractFunctionAction';

// Borsh deserializes `u8` arrays into plain number arrays, not Uint8Array.
const fromNearcoreDelegableAction = (action: NearcoreDelegableAction): DelegableAction => {
  if ('createAccount' in action) return { actionType: 'CreateSubAccount' };

  if ('transfer' in action)
    return { actionType: 'Transfer', amount: { yoctoNear: action.transfer.deposit } };

  if ('deployContract' in action)
    return {
      actionType: 'DeployLocalContract',
      wasmU8: Uint8Array.from(action.deployContract.code),
    };

  if ('functionCall' in action) return fromNearcoreCallContractFunctionAction(action.functionCall);

  if ('stake' in action)
    return {
      actionType: 'Stake',
      amount: { yoctoNear: action.stake.stake },
      validatorPublicKey: fromNearcorePublicKey(action.stake.publicKey),
    };

  if ('addKey' in action) return fromNearcoreAddAccessKeyAction(action.addKey);

  if ('deleteKey' in action)
    return {
      actionType: 'DeleteAccessKey',
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
          actionType: 'PublishPinnableGlobalContract',
          wasmU8,
        }
      : {
          actionType: 'PublishLinkableGlobalContract',
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

  // A delegation can carry an action this library cannot represent (ExecuteDelegation) only if
  // it was created outside of it.
  throw new Error('Unsupported delegable action', { cause: action });
};

export type WireDelegation = Omit<NearcoreDelegation, 'tag'>;

export const fromNearcoreDelegation = (
  delegation: WireDelegation,
): SignedDelegation['delegation'] => ({
  tag: constants.Delegation.Nep366Tag,
  delegator: {
    accountId: delegation.senderId,
    publicKey: fromNearcorePublicKey(delegation.publicKey),
    replayProtection: { nonce: Number(delegation.nonce) },
  },
  receiverAccountId: delegation.receiverId,
  expiration: { blockHeight: Number(delegation.maxBlockHeight) },
  delegatedActions: delegation.actions.map(fromNearcoreDelegableAction),
});
