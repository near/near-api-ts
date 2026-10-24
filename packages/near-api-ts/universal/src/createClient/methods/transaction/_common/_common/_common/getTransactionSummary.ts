import type { ActionView } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../../../types/_common/common';
import type { SignedTransactionReplayProtection } from '../../../../../../../types/_common/transaction/transaction';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
} from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ProtocolEra } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import type {
  TransactionActionSummaries,
  TransactionSummary,
} from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/conversionStep';
import { type NatError } from '../../../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../../../_common/_common/_common/result';
import type { RpcTransactionSummary } from '../../zodSchemas/rpcTransactionDetails/rpcTransactionSummary';
import { getParsedActionSummary } from './_common/getParsedActionSummary';
import { getRawActionSummary } from './_common/getRawActionSummary/getRawActionSummary';

const getTransactionActionSummaries = <
  PE extends ProtocolEra,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE>,
>(
  rpcActions: ActionView[],
  protocolEras: PE[],
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn<PE>,
): Result<
  TransactionActionSummaries<PE, ASF>,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const rawActionSummaries = rpcActions.map((rpcAction) =>
    getRawActionSummary(rpcAction, protocolEras),
  );

  // If a user wants to use his own custom deserializer:
  if (deserializeActionSummaries) {
    try {
      return result.ok(
        deserializeActionSummaries({ rawActionSummaries }) as TransactionActionSummaries<PE, ASF>,
      );
    } catch (cause) {
      return resultNatError('Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed', {
        cause,
        rawActionSummaries,
      });
    }
  }
  // If no custom deserializer is provided, use the default one and return default ActionSummaries
  // with unknown callContractFunction.functionArgs type
  return result.ok(
    rawActionSummaries.map(getParsedActionSummary) as TransactionActionSummaries<PE, ASF>,
  );
};

// Nearcore leaves `nonceMode` out for its default, `monotonic`, which a TransactionV0 has too.
const getReplayProtection = ({
  nonce,
  nonceIndex,
  nonceMode,
}: RpcTransactionSummary): SignedTransactionReplayProtection => {
  const nonceProgression = nonceMode === 'strict' ? 'Consecutive' : 'Increasing';

  return typeof nonceIndex === 'number'
    ? { scheme: 'NonceChannels', nonceChannelId: nonceIndex, nonce, nonceProgression }
    : { scheme: 'NonceChannel', nonce, nonceProgression };
};

export const getTransactionSummary = <PE extends ProtocolEra>(
  transaction: RpcTransactionSummary,
  protocolEras: PE[],
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn<PE>,
): Result<
  TransactionSummary<PE>,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const actionSummaries = getTransactionActionSummaries(
    transaction.actions,
    protocolEras,
    deserializeActionSummaries,
  );
  if (!actionSummaries.success) return actionSummaries;

  return result.ok({
    signer: {
      accountId: transaction.signerId,
      publicKey: transaction.publicKey.publicKey,
      replayProtection: getReplayProtection(transaction),
    },
    receiverAccountId: transaction.receiverId,
    actionSummaries: actionSummaries.data,
    signature: transaction.signature.signature,
  });
};
