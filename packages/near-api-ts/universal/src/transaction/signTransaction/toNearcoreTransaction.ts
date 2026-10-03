import type { NearcoreExecuteDelegationAction } from '../../../types/_common/transaction/actions/executeDelegation/executeDelegation';
import type {
  NearcoreNonceMode,
  NearcoreTransaction,
  NearcoreTransactionAction,
} from '../../../types/_common/transaction/transaction';
import { constants } from '../../_common/_common/_common/constants';
import { toNearcorePublicKey } from '../_common/_common/_common/toNearcorePublicKey';
import { toNearcoreAddAccessKeyAction } from '../_common/_common/toNearcore/toNearcoreAddAccessKey';
import { toNearcoreCreateAccountAction } from '../_common/_common/toNearcore/toNearcoreCreateAccount';
import { toNearcoreDeleteAccountAction } from '../_common/_common/toNearcore/toNearcoreDeleteAccount';
import { toNearcoreDeleteKeyAction } from '../_common/_common/toNearcore/toNearcoreDeleteKey';
import { toNearcoreDeployContractAction } from '../_common/_common/toNearcore/toNearcoreDeployContract';
import { toNearcoreFunctionCallAction } from '../_common/_common/toNearcore/toNearcoreFunctionCall';
import { toNearcoreLinkGlobalContractAction } from '../_common/_common/toNearcore/toNearcoreLinkGlobalContract';
import { toNearcorePinGlobalContractAction } from '../_common/_common/toNearcore/toNearcorePinGlobalContract';
import { toNearcoreRegisterLinkableGlobalContractAction } from '../_common/_common/toNearcore/toNearcoreRegisterLinkableGlobalContract';
import { toNearcoreRegisterPinnableGlobalContractAction } from '../_common/_common/toNearcore/toNearcoreRegisterPinnableGlobalContract';
import { toNearcoreStakeAction } from '../_common/_common/toNearcore/toNearcoreStake';
import { toNearcoreTopUpAccessKeyBalanceAction } from '../_common/_common/toNearcore/toNearcoreTopUpAccessKeyBalance';
import { toNearcoreTransactionNonce } from '../_common/_common/toNearcore/toNearcoreTransactionNonce';
import { toNearcoreTransferAction } from '../_common/_common/toNearcore/toNearcoreTransfer';
import { toNearcoreWithdrawAccessKeyBalanceAction } from '../_common/_common/toNearcore/toNearcoreWithdrawAccessKeyBalance';
import { toNearcoreDelegationV1, toNearcoreDelegationV2 } from '../_common/toNearcoreDelegation';
import { toNearcoreSignature } from '../_common/toNearcoreSignature';
import type {
  InnerExecuteDelegationAction,
  InnerTransaction,
  InnerTransactionAction,
  InnerTransactionReplayProtection,
} from './transactionZodSchema';

// The tag the delegation was signed with decides which of the two nearcore actions carries it.
const toNearcoreExecuteDelegation = ({
  signedDelegation: { delegation, signature },
}: InnerExecuteDelegationAction): NearcoreExecuteDelegationAction =>
  delegation.tag === constants.Delegation.Nep366Tag
    ? {
        delegate: {
          delegation: toNearcoreDelegationV1(delegation),
          signature: toNearcoreSignature(signature),
        },
      }
    : {
        delegateV2: {
          delegation: toNearcoreDelegationV2(delegation),
          signature: toNearcoreSignature(signature),
        },
      };

const toNearcoreTransactionAction = (action: InnerTransactionAction): NearcoreTransactionAction => {
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
    case 'ExecuteDelegation':
      return toNearcoreExecuteDelegation(action);
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

const toNearcoreTransactionActions = (
  actions: Pick<InnerTransaction, 'action' | 'actions'>,
): NearcoreTransactionAction[] => {
  if (actions.action) return [toNearcoreTransactionAction(actions.action)];
  if (actions.actions) return actions.actions.map((action) => toNearcoreTransactionAction(action));
  return [];
};

const toNearcoreNonceMode = ({
  nonceProgression,
}: InnerTransactionReplayProtection): NearcoreNonceMode =>
  nonceProgression === 'Consecutive' ? { strict: {} } : { monotonic: {} };

export const toNearcoreTransaction = (transaction: InnerTransaction): NearcoreTransaction => ({
  version: 1,
  signerId: transaction.signer.accountId,
  publicKey: toNearcorePublicKey(transaction.signer.publicKey),
  nonce: toNearcoreTransactionNonce(transaction.signer.replayProtection),
  receiverId: transaction.receiverAccountId,
  blockHash: transaction.recentBlockHash.cryptoHashU8,
  actions: toNearcoreTransactionActions(transaction),
  nonceMode: toNearcoreNonceMode(transaction.signer.replayProtection),
});
