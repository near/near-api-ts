import type {
  NearcoreDelegableAction,
  NearcoreDelegation,
} from '../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { constants } from '../../../_common/_common/_common/constants';
import { toNearcorePublicKey } from '../_common/_common/toNearcore/publicKey';
import { toNearcoreAddKeyAction } from '../_common/toNearcore/delegableActions/addKey';
import { toNearcoreCreateAccountAction } from '../_common/toNearcore/delegableActions/createAccount';
import { toNearcoreDeleteAccountAction } from '../_common/toNearcore/delegableActions/deleteAccount';
import { toNearcoreDeleteKeyAction } from '../_common/toNearcore/delegableActions/deleteKey';
import { toNearcoreDeployContractAction } from '../_common/toNearcore/delegableActions/deployContract';
import { toNearcoreFunctionCallAction } from '../_common/toNearcore/delegableActions/functionCall';
import { toNearcoreStakeAction } from '../_common/toNearcore/delegableActions/stake';
import { toNearcoreTransferAction } from '../_common/toNearcore/delegableActions/transfer';
import type { InnerDelegatedAction, InnerDelegation } from '../_common/zodSchemas/delegation';

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
  maxBlockHeight: delegation.expireAt.blockHeight,
  publicKey: toNearcorePublicKey(delegation.delegatorPublicKey),
});
