import type { Result } from '../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionSummary } from '../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type { NatError } from '../../../../../_common/natError';
import type { RpcTransactionSummary } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../_common/utils/result';
import { getActionSummaries } from './getActionSummary/getActionSummaries';

export const getTransactionSummary = (
  transaction: RpcTransactionSummary,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
): Result<
  TransactionSummary,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const actionSummaries = getActionSummaries(transaction.actions, deserializeActionSummaries);
  if (!actionSummaries.ok) return actionSummaries;

  return result.ok({
    signerAccountId: transaction.signerId,
    signerPublicKey: transaction.publicKey.publicKey,
    nonce: transaction.nonce,
    receiverAccountId: transaction.receiverId,
    actionSummaries: actionSummaries.value,
    signature: transaction.signature.signature,
  });
};
