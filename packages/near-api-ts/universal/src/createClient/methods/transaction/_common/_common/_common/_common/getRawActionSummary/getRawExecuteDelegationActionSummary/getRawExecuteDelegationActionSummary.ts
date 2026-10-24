import type { DelegateAction, DelegateActionV2, TransactionNonce } from '@near-js/jsonrpc-types';
import type { PublicKey, Signature } from '../../../../../../../../../../types/_common/crypto';
import type {
  LegacyExecuteDelegationReplayProtectionSummary,
  RawTransactionActionSummary,
} from '../../../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/actionSummaries';
import type { ProtocolEra } from '../../../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import { constants } from '../../../../../../../../../_common/_common/_common/constants';
import { getRawDelegatedActionSummary } from './getRawDelegatedActionSummary';

const toReplayProtectionSummary = (
  nonce: TransactionNonce,
): LegacyExecuteDelegationReplayProtectionSummary =>
  'GasKeyNonce' in nonce
    ? {
        scheme: 'NonceChannels',
        nonceChannelId: nonce.GasKeyNonce.nonceIndex,
        nonce: nonce.GasKeyNonce.nonce,
      }
    : { scheme: 'NonceChannel', nonce: nonce.Nonce.nonce };

// Nearcore reports the two delegation formats as two actions - `Delegate` (NEP-366), whose nonce
// is a plain number, and `DelegateV2` (NEP-611), whose nonce may name a nonce channel. The current
// protocol takes only the first one; the second is refused since protocol 87, so it reads as
// `@legacy`, but transactions sent before it still carry one.
export const getRawExecuteDelegationActionSummary = (
  delegation:
    | { tag: typeof constants.Delegation.Nep366Tag; delegateAction: DelegateAction }
    | { tag: typeof constants.Delegation.Nep611Tag; delegateAction: DelegateActionV2 },
  signature: Signature,
  protocolEras: readonly ProtocolEra[],
): RawTransactionActionSummary<'Live' | 'Legacy'> => {
  const { delegateAction } = delegation;

  const delegator = {
    accountId: delegateAction.senderId,
    publicKey: delegateAction.publicKey as PublicKey,
  };
  const delegatedActionSummaries = delegateAction.actions.map((nonDelegateAction) =>
    getRawDelegatedActionSummary(nonDelegateAction, protocolEras),
  );
  const receiverAccountId = delegateAction.receiverId;
  const expiration = { blockHeight: delegateAction.maxBlockHeight };

  if (delegation.tag === constants.Delegation.Nep366Tag)
    return {
      actionType: 'ExecuteDelegation',
      delegation: {
        tag: delegation.tag,
        delegator: {
          ...delegator,
          replayProtection: { scheme: 'NonceChannel', nonce: delegation.delegateAction.nonce },
        },
        delegatedActionSummaries,
        receiverAccountId,
        expiration,
      },
      signature,
    };

  return {
    actionType: 'LegacyExecuteDelegation',
    delegation: {
      tag: delegation.tag,
      delegator: {
        ...delegator,
        replayProtection: toReplayProtectionSummary(delegation.delegateAction.nonce),
      },
      delegatedActionSummaries,
      receiverAccountId,
      expiration,
    },
    signature,
  };
};
