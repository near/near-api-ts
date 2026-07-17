import type { ActionView } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
} from '../../../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionActionSummaries } from '../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import { type NatError, resultNatError } from '../../../../../../_common/natError';
import { result } from '../../../../../../_common/utils/result';
import { getParsedActionSummary } from './getParsedActionSummary';
import { getRawActionSummary } from './getRawActionSummary';

export const getActionSummaries = <ASF extends MaybeBaseDeserializeTransactionActionSummariesFn>(
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
