import type {
  NearcoreDelegableAction,
  NearcoreDelegation,
} from '../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { constants } from '../../../_common/_common/_common/constants';
import { toNearcorePublicKey } from '../_common/_common/toNearcore/toNearcorePublicKey';
import { toNearcoreAddKeyAction } from '../_common/toNearcore/toNearcoreAddKey';
import { toNearcoreCreateAccountAction } from '../_common/toNearcore/toNearcoreCreateAccount';
import { toNearcoreDeleteAccountAction } from '../_common/toNearcore/toNearcoreDeleteAccount';
import { toNearcoreDeleteKeyAction } from '../_common/toNearcore/toNearcoreDeleteKey';
import { toNearcoreDeployContractAction } from '../_common/toNearcore/toNearcoreDeployContract';
import { toNearcoreFunctionCallAction } from '../_common/toNearcore/toNearcoreFunctionCall';
import { toNearcoreStakeAction } from '../_common/toNearcore/toNearcoreStake';
import { toNearcoreTransferAction } from '../_common/toNearcore/toNearcoreTransfer';
import type { InnerDelegatedAction, InnerDelegation } from '../zodSchemas/delegation';

const toNearcoreDelegableAction = (action: InnerDelegatedAction): NearcoreDelegableAction => {
  switch (action.actionType) {
    case 'CreateAccount':
      return toNearcoreCreateAccountAction();
    case 'AddKey':
      return toNearcoreAddKeyAction(action);
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
  maxBlockHeight: delegation.expiration.blockHeight,
  publicKey: toNearcorePublicKey(delegation.delegatorPublicKey),
});
