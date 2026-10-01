import type {
  NearcoreDelegableAction,
  NearcoreDelegation,
} from '../../../types/_common/transaction/actions/executeDelegation/delegation';
import { constants } from '../../_common/_common/_common/constants';
import { toNearcorePublicKey } from './_common/_common/toNearcorePublicKey';
import { toNearcoreAddAccessKeyAction } from './_common/toNearcore/toNearcoreAddAccessKey';
import { toNearcoreCreateAccountAction } from './_common/toNearcore/toNearcoreCreateAccount';
import { toNearcoreDeleteAccountAction } from './_common/toNearcore/toNearcoreDeleteAccount';
import { toNearcoreDeleteKeyAction } from './_common/toNearcore/toNearcoreDeleteKey';
import { toNearcoreDeployContractAction } from './_common/toNearcore/toNearcoreDeployContract';
import { toNearcoreFunctionCallAction } from './_common/toNearcore/toNearcoreFunctionCall';
import { toNearcoreLinkGlobalContractAction } from './_common/toNearcore/toNearcoreLinkGlobalContract';
import { toNearcorePinGlobalContractAction } from './_common/toNearcore/toNearcorePinGlobalContract';
import { toNearcoreRegisterLinkableGlobalContractAction } from './_common/toNearcore/toNearcoreRegisterLinkableGlobalContract';
import { toNearcoreRegisterPinnableGlobalContractAction } from './_common/toNearcore/toNearcoreRegisterPinnableGlobalContract';
import { toNearcoreStakeAction } from './_common/toNearcore/toNearcoreStake';
import { toNearcoreTopUpAccessKeyBalanceAction } from './_common/toNearcore/toNearcoreTopUpAccessKeyBalance';
import { toNearcoreTransferAction } from './_common/toNearcore/toNearcoreTransfer';
import { toNearcoreWithdrawAccessKeyBalanceAction } from './_common/toNearcore/toNearcoreWithdrawAccessKeyBalance';
import type { InnerDelegableAction, InnerDelegation } from './delegationZodSchema';

const toNearcoreDelegableAction = (action: InnerDelegableAction): NearcoreDelegableAction => {
  switch (action.actionType) {
    case 'CreateAccount':
      return toNearcoreCreateAccountAction();
    case 'AddAccessKey':
      return toNearcoreAddAccessKeyAction(action);
    case 'Transfer':
      return toNearcoreTransferAction(action);
    case 'DeployContract':
      return toNearcoreDeployContractAction(action);
    case 'FunctionCall':
      return toNearcoreFunctionCallAction(action);
    case 'Stake':
      return toNearcoreStakeAction(action);
    case 'DeleteKey':
      return toNearcoreDeleteKeyAction(action);
    case 'DeleteAccount':
      return toNearcoreDeleteAccountAction(action);
    case 'RegisterPinnableGlobalContract':
      return toNearcoreRegisterPinnableGlobalContractAction(action);
    case 'RegisterLinkableGlobalContract':
      return toNearcoreRegisterLinkableGlobalContractAction(action);
    case 'LinkGlobalContract':
      return toNearcoreLinkGlobalContractAction(action);
    case 'PinGlobalContract':
      return toNearcorePinGlobalContractAction(action);
    case 'TopUpAccessKeyBalance':
      return toNearcoreTopUpAccessKeyBalanceAction(action);
    case 'WithdrawAccessKeyBalance':
      return toNearcoreWithdrawAccessKeyBalanceAction(action);
  }
};

const toNearcoreDelegableActions = (
  delegation: Pick<InnerDelegation, 'delegatedAction' | 'delegatedActions'>,
): NearcoreDelegableAction[] => {
  if (delegation.delegatedAction) return [toNearcoreDelegableAction(delegation.delegatedAction)];
  if (delegation.delegatedActions)
    return delegation.delegatedActions.map((delegatedAction) =>
      toNearcoreDelegableAction(delegatedAction),
    );
  return [];
};

export const toNearcoreDelegation = (delegation: InnerDelegation): NearcoreDelegation => ({
  tag: constants.Nep366MetaTransaction.Tag,
  senderId: delegation.delegatorAccountId,
  receiverId: delegation.receiverAccountId,
  actions: toNearcoreDelegableActions(delegation),
  nonce: BigInt(delegation.nonce),
  maxBlockHeight: BigInt(delegation.expiration.blockHeight),
  publicKey: toNearcorePublicKey(delegation.delegatorPublicKey),
});
