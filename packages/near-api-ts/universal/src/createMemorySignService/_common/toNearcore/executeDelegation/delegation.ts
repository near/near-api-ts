import { type } from 'node:os';
import type { ExtractStrict } from 'type-fest';
import type { NearcoreDelegableAction } from '../../../../../types/_common/transaction/actions/executeDelegation/delegation';
import { constants } from '../../../../_common/_common/_common/constants';
import type { SignDelegationArgs } from '../../../signDelegation/signDelegation';
import type { InnerDelegatedAction } from '../../zodSchemas/transaction/executeDelegation/delegation';
import { toNearcorePublicKey } from '../_common/_common/publicKey';
import { toNearcoreAddKeyAction } from '../_common/delegableActions/addKey';
import { toNearcoreCreateAccountAction } from '../_common/delegableActions/createAccount';
import { toNearcoreDeleteAccountAction } from '../_common/delegableActions/deleteAccount';
import { toNearcoreDeleteKeyAction } from '../_common/delegableActions/deleteKey';
import { toNearcoreDeployContractAction } from '../_common/delegableActions/deployContract';
import { toNearcoreFunctionCallAction } from '../_common/delegableActions/functionCall';
import { toNearcoreStakeAction } from '../_common/delegableActions/stake';
import { toNearcoreTransferAction } from '../_common/delegableActions/transfer';

const toNearcoreDelegableAction = (action: InnerDelegatedAction) => {
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
  args: Pick<SignDelegationArgs['delegation'], 'delegatedAction' | 'delegatedActions'>,
) => {
  if (args.delegatedAction) return [toNearcoreDelegableAction(args.delegatedAction)];
  if (args.delegatedActions)
    return args.delegatedActions.map((delegatedAction) =>
      toNearcoreDelegableAction(delegatedAction),
    );
  return [];
};

export const toNearcoreDelegation = (delegation: SignDelegationArgs['delegation']) => ({
  tag: constants.Nep413Message.Tag,
  signerId: delegation.signerAccountId,
  publicKey: toNearcorePublicKey(delegation.signerPublicKey),
  actions: toNearcoreDelegableActions(delegation),
  receiverId: delegation.receiverAccountId,
  nonce: BigInt(delegation.nonce),
  maxBlockHeight: delegation.expireAt.blockHeight,
});
