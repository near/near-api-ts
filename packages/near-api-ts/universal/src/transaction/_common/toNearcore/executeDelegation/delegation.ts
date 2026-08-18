import type {
  NearcoreDelegableAction,
  NearcoreDelegation,
} from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { constants } from '../../../../_common/_common/_common/constants';
import type { InnerDelegatedAction, InnerDelegation } from '../../_common/zodSchemas/delegation';
import { toNearcorePublicKey } from '../_common/_common/publicKey';
import { toNearcoreAddKeyAction } from '../_common/delegableActions/addKey';
import { toNearcoreCreateAccountAction } from '../_common/delegableActions/createAccount';
import { toNearcoreDeleteAccountAction } from '../_common/delegableActions/deleteAccount';
import { toNearcoreDeleteKeyAction } from '../_common/delegableActions/deleteKey';
import { toNearcoreDeployContractAction } from '../_common/delegableActions/deployContract';
import { toNearcoreFunctionCallAction } from '../_common/delegableActions/functionCall';
import { toNearcoreStakeAction } from '../_common/delegableActions/stake';
import { toNearcoreTransferAction } from '../_common/delegableActions/transfer';

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
  senderId: delegation.senderAccountId,
  receiverId: delegation.receiverAccountId,
  actions: toNearcoreDelegableActions(delegation),
  nonce: BigInt(delegation.nonce),
  maxBlockHeight: delegation.expireAt.blockHeight,
  publicKey: toNearcorePublicKey(delegation.senderPublicKey),
});
