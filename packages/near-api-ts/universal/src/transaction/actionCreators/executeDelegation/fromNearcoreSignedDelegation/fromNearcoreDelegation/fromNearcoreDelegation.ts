import type { NearcoreAddKeyAction } from '../../../../../../types/_common/transaction/actions/delegableActions/addKey';
import type { NearcoreFunctionCallAction } from '../../../../../../types/_common/transaction/actions/delegableActions/functionCall';
import type {
  DelegableAction,
  NearcoreDelegableAction,
  NearcoreDelegation,
  SignedDelegation,
} from '../../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { constants } from '../../../../../_common/_common/_common/constants';
import { fromNearcorePublicKey } from './fromNearcorePublicKey';

const fromNearcoreFunctionCallAction = ({
  methodName,
  args,
  gas,
  deposit,
}: NearcoreFunctionCallAction['functionCall']): DelegableAction => ({
  actionType: 'FunctionCall',
  functionName: methodName,
  functionArgs: Uint8Array.from(args),
  gasLimit: { gas },
  attachedDeposit: deposit > 0n ? { yoctoNear: deposit } : undefined,
});

const fromNearcoreAddKeyAction = ({
  publicKey,
  accessKey,
}: NearcoreAddKeyAction['addKey']): DelegableAction => {
  if ('fullAccess' in accessKey.permission)
    return {
      actionType: 'AddKey',
      accessType: 'FullAccess',
      publicKey: fromNearcorePublicKey(publicKey),
    };

  const { receiverId, allowance, methodNames } = accessKey.permission.functionCall;

  return {
    actionType: 'AddKey',
    accessType: 'FunctionCall',
    publicKey: fromNearcorePublicKey(publicKey),
    contractAccountId: receiverId,
    gasBudget: allowance === null ? 'Unlimited' : { yoctoNear: allowance },
    allowedFunctions: methodNames.length > 0 ? methodNames : 'AllNonPayable',
  };
};

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

  if ('addKey' in action) return fromNearcoreAddKeyAction(action.addKey);

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

  // A delegation can carry actions this library cannot represent (ExecuteDelegation,
  // DeployGlobalContract, UseGlobalContract) only if it was created outside of it.
  throw new Error('Unsupported delegable action', { cause: action });
};

export const fromNearcoreDelegation = (
  delegation: Omit<NearcoreDelegation, 'tag'>,
): SignedDelegation['delegation'] => ({
  tag: constants.Nep366MetaTransaction.Tag,
  delegatorAccountId: delegation.senderId,
  delegatorPublicKey: fromNearcorePublicKey(delegation.publicKey),
  receiverAccountId: delegation.receiverId,
  nonce: Number(delegation.nonce),
  expiration: { blockHeight: Number(delegation.maxBlockHeight) },
  delegatedActions: delegation.actions.map(fromNearcoreDelegableAction),
});
