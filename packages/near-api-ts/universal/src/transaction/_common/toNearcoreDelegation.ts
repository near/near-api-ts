import type {
  NearcoreDelegableAction,
  NearcoreDelegation,
} from '../../../types/_common/transaction/actions/executeDelegation/delegation';
import { constants } from '../../_common/_common/_common/constants';
import { toNearcorePublicKey } from './_common/_common/toNearcorePublicKey';
import { toNearcoreAddAccessKeyAction } from './_common/toNearcore/toNearcoreAddAccessKey';
import { toNearcoreCallContractFunctionAction } from './_common/toNearcore/toNearcoreCallContractFunction';
import { toNearcoreCreateSubAccountAction } from './_common/toNearcore/toNearcoreCreateSubAccount';
import { toNearcoreDeleteAccessKeyAction } from './_common/toNearcore/toNearcoreDeleteAccessKey';
import { toNearcoreDeleteAccountAction } from './_common/toNearcore/toNearcoreDeleteAccount';
import { toNearcoreDeployLocalContractAction } from './_common/toNearcore/toNearcoreDeployLocalContract';
import { toNearcoreLinkGlobalContractAction } from './_common/toNearcore/toNearcoreLinkGlobalContract';
import { toNearcorePinGlobalContractAction } from './_common/toNearcore/toNearcorePinGlobalContract';
import { toNearcorePublishLinkableGlobalContractAction } from './_common/toNearcore/toNearcorePublishLinkableGlobalContract';
import { toNearcorePublishPinnableGlobalContractAction } from './_common/toNearcore/toNearcorePublishPinnableGlobalContract';
import { toNearcoreStakeAction } from './_common/toNearcore/toNearcoreStake';
import { toNearcoreTopUpAccessKeyBalanceAction } from './_common/toNearcore/toNearcoreTopUpAccessKeyBalance';
import { toNearcoreTransferAction } from './_common/toNearcore/toNearcoreTransfer';
import type {
  InnerDelegableAction,
  InnerDelegation,
  InnerSignedDelegation,
} from './delegationZodSchema';

const toNearcoreDelegableAction = (action: InnerDelegableAction): NearcoreDelegableAction => {
  switch (action.actionType) {
    case 'CreateSubAccount':
      return toNearcoreCreateSubAccountAction();
    case 'AddAccessKey':
      return toNearcoreAddAccessKeyAction(action);
    case 'Transfer':
      return toNearcoreTransferAction(action);
    case 'DeployLocalContract':
      return toNearcoreDeployLocalContractAction(action);
    case 'CallContractFunction':
      return toNearcoreCallContractFunctionAction(action);
    case 'Stake':
      return toNearcoreStakeAction(action);
    case 'DeleteAccessKey':
      return toNearcoreDeleteAccessKeyAction(action);
    case 'DeleteAccount':
      return toNearcoreDeleteAccountAction(action);
    case 'PublishPinnableGlobalContract':
      return toNearcorePublishPinnableGlobalContractAction(action);
    case 'PublishLinkableGlobalContract':
      return toNearcorePublishLinkableGlobalContractAction(action);
    case 'LinkGlobalContract':
      return toNearcoreLinkGlobalContractAction(action);
    case 'PinGlobalContract':
      return toNearcorePinGlobalContractAction(action);
    case 'TopUpAccessKeyBalance':
      return toNearcoreTopUpAccessKeyBalanceAction(action);
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

// Takes both the delegation `signDelegation` signs and the signed one a relayer sends.
export const toNearcoreDelegation = (
  delegation: InnerDelegation | InnerSignedDelegation['delegation'],
): NearcoreDelegation => ({
  tag: constants.Delegation.Nep366Tag,
  senderId: delegation.delegator.accountId,
  receiverId: delegation.receiverAccountId,
  actions: toNearcoreDelegableActions(delegation),
  nonce: BigInt(delegation.delegator.replayProtection.nonce),
  maxBlockHeight: BigInt(delegation.expiration.blockHeight),
  publicKey: toNearcorePublicKey(delegation.delegator.publicKey),
});
