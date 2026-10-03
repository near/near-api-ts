import type { ActionView } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../../../types/_common/common';
import type { SignedTransactionReplayProtection } from '../../../../../../../types/_common/transaction/transaction';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
} from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
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
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
>(
  rpcActions: ActionView[],
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
): Result<
  TransactionActionSummaries<ASF>,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const rawActionSummaries = rpcActions.map(getRawActionSummary);

  // If a user wants to use his own custom deserializer:
  if (deserializeActionSummaries) {
    try {
      return result.ok(
        deserializeActionSummaries({ rawActionSummaries }) as TransactionActionSummaries<ASF>,
      );
    } catch (cause) {
      return resultNatError('Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed', {
        cause,
        rawActionSummaries,
      });
    }
  }
  // If no custom deserializer is provided, use the default one and return default ActionSummaries
  // with unknown functionCall.functionArgs type
  return result.ok(
    rawActionSummaries.map(getParsedActionSummary) as TransactionActionSummaries<ASF>,
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

export const getTransactionSummary = (
  transaction: RpcTransactionSummary,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
): Result<
  TransactionSummary,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const actionSummaries = getTransactionActionSummaries(
    transaction.actions,
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
